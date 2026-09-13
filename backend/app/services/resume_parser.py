import io
import re
from typing import Dict, Any, List, Optional, Tuple
from pypdf import PdfReader
from app.schemas.resume_analysis import (
    ResumeExtractedData,
    EducationItem,
    ExperienceItem,
    ProjectItem,
    LinkItem
)

# Canonical skill aliases dictionary
SKILL_TAXONOMY: Dict[str, str] = {
    "python": "Python",
    "python3": "Python",
    "py": "Python",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "react": "React",
    "react.js": "React",
    "reactjs": "React",
    "react native": "React Native",
    "vue": "Vue.js",
    "vue.js": "Vue.js",
    "vuejs": "Vue.js",
    "angular": "Angular",
    "angularjs": "Angular",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "node": "Node.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "express": "Express.js",
    "express.js": "Express.js",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "html": "HTML5",
    "html5": "HTML5",
    "css": "CSS3",
    "css3": "CSS3",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "bootstrap": "Bootstrap",
    "sql": "SQL",
    "mysql": "MySQL",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "sqlite": "SQLite",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    "redis": "Redis",
    "kafka": "Apache Kafka",
    "rabbitmq": "RabbitMQ",
    "docker": "Docker",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "Google Cloud (GCP)",
    "google cloud": "Google Cloud (GCP)",
    "azure": "Microsoft Azure",
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "linux": "Linux",
    "bash": "Bash/Shell",
    "shell": "Bash/Shell",
    "rest": "REST APIs",
    "rest api": "REST APIs",
    "restful": "REST APIs",
    "restful api": "REST APIs",
    "graphql": "GraphQL",
    "grpc": "gRPC",
    "c++": "C++",
    "cpp": "C++",
    "c": "C",
    "c#": "C#",
    "csharp": "C#",
    ".net": ".NET",
    "dotnet": ".NET",
    "java": "Java",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "golang": "Go",
    "go": "Go",
    "rust": "Rust",
    "php": "PHP",
    "laravel": "Laravel",
    "ruby": "Ruby",
    "rails": "Ruby on Rails",
    "ruby on rails": "Ruby on Rails",
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "dl": "Deep Learning",
    "nlp": "Natural Language Processing (NLP)",
    "natural language processing": "Natural Language Processing (NLP)",
    "computer vision": "Computer Vision",
    "cv": "Computer Vision",
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "tf": "TensorFlow",
    "keras": "Keras",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scikit-learn": "Scikit-Learn",
    "sklearn": "Scikit-Learn",
    "spark": "Apache Spark",
    "apache spark": "Apache Spark",
    "hadoop": "Hadoop",
    "tableau": "Tableau",
    "power bi": "Power BI",
    "powerbi": "Power BI",
    "agile": "Agile/Scrum",
    "scrum": "Agile/Scrum",
    "jira": "Jira",
    "jest": "Jest",
    "pytest": "PyTest",
    "selenium": "Selenium",
    "cypress": "Cypress",
    "postman": "Postman",
    "microservices": "Microservices",
    "system design": "System Design"
}

SECTION_HEADERS = {
    "experience": [
        "work experience", "experience", "employment history", "professional experience",
        "work history", "career history", "internships", "internship experience"
    ],
    "education": [
        "education", "educational background", "academic background", "qualifications",
        "academics", "degrees", "educational qualifications"
    ],
    "skills": [
        "skills", "technical skills", "skills & expertise", "core competencies",
        "technologies", "tech stack", "tools & technologies", "programming skills"
    ],
    "projects": [
        "projects", "technical projects", "key projects", "academic projects",
        "personal projects", "portfolio projects"
    ],
    "certifications": [
        "certifications", "certificates", "licenses & certifications",
        "professional certifications", "accreditations"
    ],
    "summary": [
        "summary", "professional summary", "about me", "profile", "objective",
        "career objective", "executive summary"
    ]
}

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract raw text from PDF bytes using pypdf.
    Validates magic bytes, checks for encryption, and ensures readable text.
    """
    if not file_bytes.startswith(b"%PDF-"):
        raise ValueError("Invalid PDF format: file does not start with standard PDF header (%PDF-).")

    try:
        reader = PdfReader(io.BytesIO(file_bytes))
    except Exception as e:
        raise ValueError(f"Unable to read PDF file: {str(e)}")

    if reader.is_encrypted:
        raise ValueError("Encrypted/password-protected PDFs are not supported. Please upload an unlocked PDF.")

    extracted_pages: List[str] = []
    for idx, page in enumerate(reader.pages):
        try:
            page_text = page.extract_text() or ""
            if page_text.strip():
                extracted_pages.append(page_text.strip())
        except Exception as e:
            # Continue reading subsequent pages if one page fails
            continue

    full_text = "\n\n".join(extracted_pages).strip()

    if not full_text or len(full_text) < 30:
        raise ValueError(
            "PDF contains no extractable text. The file may be an image-only scan or empty. "
            "Please upload a text-searchable PDF resume."
        )

    # Normalize line breaks and tabs
    full_text = re.sub(r"\r\n|\r", "\n", full_text)
    full_text = re.sub(r"\t", " ", full_text)
    return full_text

def segment_sections(text: str) -> Dict[str, str]:
    """
    Segment the resume text into logical sections based on common headers.
    """
    lines = text.split("\n")
    sections: Dict[str, List[str]] = {
        "header": [],
        "summary": [],
        "experience": [],
        "education": [],
        "skills": [],
        "projects": [],
        "certifications": [],
        "other": []
    }

    current_section = "header"

    for line in lines:
        cleaned_line = line.strip().lower()
        # Clean special chars from line to match header
        normalized_header = re.sub(r"[:\-_|•*#]", "", cleaned_line).strip()

        matched_section = None
        for sec_name, header_aliases in SECTION_HEADERS.items():
            if normalized_header in header_aliases or (len(normalized_header) < 35 and any(h == normalized_header for h in header_aliases)):
                matched_section = sec_name
                break

        if matched_section:
            current_section = matched_section
        else:
            sections[current_section].append(line)

    return {k: "\n".join(v).strip() for k, v in sections.items() if v}

def extract_contact_info(text: str) -> Tuple[Optional[str], Optional[str], Optional[str], List[LinkItem]]:
    """
    Extract email, phone, location, and social links using high-precision regex.
    """
    # Email
    email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    email = email_match.group(0) if email_match else None

    # Phone: supports +91, (123) 456-7890, +1 234 567 8900, 10-digit Indian numbers
    phone_match = re.search(r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b", text)
    phone = phone_match.group(0) if phone_match else None

    # Links
    links: List[LinkItem] = []
    github_match = re.search(r"(?:https?://)?(?:www\.)?github\.com/[A-Za-z0-9_\-]+/?", text, re.IGNORECASE)
    if github_match:
        url = github_match.group(0)
        if not url.startswith("http"):
            url = "https://" + url
        links.append(LinkItem(name="GitHub", url=url))

    linkedin_match = re.search(r"(?:https?://)?(?:www\.)?linkedin\.com/in/[A-Za-z0-9_\-]+/?", text, re.IGNORECASE)
    if linkedin_match:
        url = linkedin_match.group(0)
        if not url.startswith("http"):
            url = "https://" + url
        links.append(LinkItem(name="LinkedIn", url=url))

    portfolio_match = re.search(r"(?:https?://)?([a-zA-Z0-9-]+\.(?:dev|me|io|in|com)(?:/[a-zA-Z0-9_#-]*)?)", text)
    if portfolio_match:
        cand_url = portfolio_match.group(0)
        if "github" not in cand_url.lower() and "linkedin" not in cand_url.lower():
            if not cand_url.startswith("http"):
                cand_url = "https://" + cand_url
            links.append(LinkItem(name="Portfolio", url=cand_url))

    # Location heuristic (e.g., "Bangalore, India", "Pune, Maharashtra", "New York, NY")
    location = None
    loc_match = re.search(r"(?:Location|Address|Based in)?[:\-]?\s*([A-Za-z\s]+,\s*[A-Za-z\s]+)", text)
    if loc_match and len(loc_match.group(1).strip()) < 50:
        loc_candidate = loc_match.group(1).strip()
        if not any(w in loc_candidate.lower() for w in ["resume", "email", "phone", "curriculum"]):
            location = loc_candidate

    return email, phone, location, links

def extract_name(text: str, email: Optional[str]) -> Optional[str]:
    """
    Extract candidate name from header lines.
    """
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    ignore_words = {"resume", "curriculum", "vitae", "cv", "page", "contact", "profile", "portfolio"}

    for line in lines[:8]:
        cleaned = re.sub(r"[^a-zA-Z\s]", "", line).strip()
        tokens = cleaned.split()
        if 2 <= len(tokens) <= 4:
            if not any(token.lower() in ignore_words for token in tokens):
                # Ensure it's not an email or url
                if "@" not in line and "http" not in line.lower() and "www." not in line.lower():
                    return " ".join([t.capitalize() for t in tokens])
    
    # Fallback to email username if nothing found
    if email:
        username = email.split("@")[0]
        cleaned_user = re.sub(r"[._0-9]", " ", username).strip()
        parts = cleaned_user.split()
        if parts:
            return " ".join([p.capitalize() for p in parts])
            
    return None

def extract_and_normalize_skills(text: str, skills_section_text: str = "") -> List[str]:
    """
    Extract skills and map aliases to canonical names using the Skill Taxonomy.
    """
    found_skills = set()
    combined_text = f"{skills_section_text}\n{text}".lower()

    # Match taxonomy keys
    for alias, canonical in SKILL_TAXONOMY.items():
        # Word boundary match for short words like "py", "c", "go", "r", "k8s"
        pattern = r"(?<![a-zA-Z0-9])" + re.escape(alias) + r"(?![a-zA-Z0-9])"
        if re.search(pattern, combined_text):
            found_skills.add(canonical)

    # Return sorted normalized skill list
    return sorted(list(found_skills))

def extract_education(edu_text: str) -> List[EducationItem]:
    """
    Extract degrees, universities, and graduation years from education section.
    """
    if not edu_text:
        return []

    items: List[EducationItem] = []
    degree_patterns = [
        r"(?:B\.?\s?Tech(?:nology)?|B\.?\s?E\.?|Bachelor of Technology|Bachelor of Engineering)",
        r"(?:M\.?\s?Tech(?:nology)?|M\.?\s?E\.?|Master of Technology)",
        r"(?:B\.?\s?S\.?|B\.?\s?Sc\.?|Bachelor of Science)",
        r"(?:M\.?\s?S\.?|M\.?\s?Sc\.?|Master of Science)",
        r"(?:BCA|Bachelor of Computer Applications)",
        r"(?:MCA|Master of Computer Applications)",
        r"(?:MBA|Master of Business Administration)",
        r"(?:Ph\.?\s?D\.?|Doctor of Philosophy)",
        r"(?:High School|Senior Secondary|12th Grade|10th Grade)"
    ]

    year_pattern = r"\b(19\d\d|20\d\d)\b"

    lines = edu_text.split("\n")
    current_item: Optional[EducationItem] = None

    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue

        matched_degree = None
        for deg_pat in degree_patterns:
            m = re.search(deg_pat, line_clean, re.IGNORECASE)
            if m:
                matched_degree = m.group(0).strip()
                break

        years = re.findall(year_pattern, line_clean)

        if matched_degree:
            if current_item:
                items.append(current_item)
            current_item = EducationItem(
                degree=matched_degree,
                start_year=years[0] if len(years) > 1 else None,
                end_year=years[1] if len(years) > 1 else (years[0] if years else None)
            )
            # Check for institution in the same line
            clean_without_deg = re.sub(deg_pat, "", line_clean, flags=re.IGNORECASE).strip(" -|,")
            if clean_without_deg and len(clean_without_deg) > 4:
                current_item.institution = clean_without_deg
        elif current_item and not current_item.institution:
            # Likely institution line
            if any(term in line_clean.lower() for term in ["university", "institute", "college", "school", "iit", "nit", "bits", "academy"]):
                current_item.institution = line_clean
                if years and not current_item.end_year:
                    current_item.end_year = years[-1]
        elif current_item and years and not current_item.end_year:
            current_item.end_year = years[-1]

    if current_item:
        items.append(current_item)

    # Fallback if specific degree pattern wasn't matched but text exists
    if not items and len(edu_text) > 10:
        years = re.findall(year_pattern, edu_text)
        items.append(EducationItem(
            institution=edu_text.split("\n")[0][:100],
            degree="Higher Education",
            end_year=years[-1] if years else None
        ))

    return items

def extract_experience(exp_text: str) -> List[ExperienceItem]:
    """
    Extract work history, companies, roles, durations, and highlights.
    """
    if not exp_text:
        return []

    items: List[ExperienceItem] = []
    lines = exp_text.split("\n")

    current_item: Optional[ExperienceItem] = None
    date_range_regex = r"(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?(?:19|20)\d{2}\s*(?:–|-|to)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?(?:(?:19|20)\d{2}|Present|Current)"

    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue

        date_match = re.search(date_range_regex, line_clean, re.IGNORECASE)

        if date_match or (line_clean.startswith(("#", "•", "*", "-")) is False and any(title in line_clean.lower() for title in ["engineer", "developer", "intern", "lead", "analyst", "manager", "architect", "consultant"])):
            # New role entry
            if current_item:
                items.append(current_item)

            duration = date_match.group(0) if date_match else None
            role_line = re.sub(date_range_regex, "", line_clean, flags=re.IGNORECASE).strip(" -|,")
            
            # Split role and company if separator exists (e.g. "Software Engineer | Google" or "Frontend Dev at Acme")
            company = None
            role = role_line
            if "|" in role_line:
                parts = role_line.split("|")
                role = parts[0].strip()
                company = parts[1].strip()
            elif " at " in role_line.lower():
                idx = role_line.lower().find(" at ")
                role = role_line[:idx].strip()
                company = role_line[idx + 4:].strip()
            elif " - " in role_line:
                parts = role_line.split(" - ")
                role = parts[0].strip()
                company = parts[1].strip()

            current_item = ExperienceItem(
                company=company or "Company",
                role=role or "Software Engineer",
                duration=duration,
                highlights=[]
            )
        elif current_item:
            # Bullet highlight or details
            clean_bullet = line_clean.lstrip("•*-# >").strip()
            if clean_bullet and len(clean_bullet) > 10:
                current_item.highlights.append(clean_bullet)

    if current_item:
        items.append(current_item)

    return items

def extract_projects(proj_text: str) -> List[ProjectItem]:
    """
    Extract project titles, descriptions, and tech stacks.
    """
    if not proj_text:
        return []

    projects: List[ProjectItem] = []
    lines = proj_text.split("\n")
    current_proj: Optional[ProjectItem] = None

    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue

        # Look for project header (e.g. "HireSense - AI Hiring Platform (Python, FastAPI, React)")
        tech_match = re.search(r"\(([^)]+)\)|\[([^\]]+)\]", line_clean)
        is_bullet = line_clean.startswith(("•", "*", "-", ">"))

        if not is_bullet and len(line_clean) < 80:
            if current_proj:
                projects.append(current_proj)

            tech_str = (tech_match.group(1) or tech_match.group(2)) if tech_match else ""
            title = re.sub(r"\([^)]+\)|\[[^\]]+\]", "", line_clean).strip(" -|:")

            tech_stack = []
            if tech_str:
                raw_tags = [t.strip() for t in re.split(r"[,/|]", tech_str) if t.strip()]
                for tag in raw_tags:
                    canon = SKILL_TAXONOMY.get(tag.lower(), tag)
                    if canon not in tech_stack:
                        tech_stack.append(canon)

            current_proj = ProjectItem(
                title=title or "Project",
                description="",
                tech_stack=tech_stack
            )
        elif current_proj:
            clean_line = line_clean.lstrip("•*-# >").strip()
            if not current_proj.description:
                current_proj.description = clean_line
            else:
                current_proj.description += " " + clean_line

    if current_proj:
        projects.append(current_proj)

    return projects

def parse_resume(file_bytes: bytes) -> Tuple[ResumeExtractedData, str]:
    """
    End-to-end resume parser:
    1. Extracts text with pypdf
    2. Segments into logical sections
    3. Parses contacts, education, skills, experience, projects, links
    4. Normalizes skill taxonomy
    5. Returns structured schema and raw text
    """
    raw_text = extract_text_from_pdf(file_bytes)
    sections = segment_sections(raw_text)

    email, phone, location, links = extract_contact_info(raw_text)
    name = extract_name(sections.get("header", raw_text[:500]), email)
    skills = extract_and_normalize_skills(raw_text, sections.get("skills", ""))
    education = extract_education(sections.get("education", ""))
    experience = extract_experience(sections.get("experience", ""))
    projects = extract_projects(sections.get("projects", ""))

    # Summary
    summary = sections.get("summary")
    if not summary and len(raw_text) > 200:
        # First paragraph under header
        header_text = sections.get("header", "")
        candidate_summary_lines = [l.strip() for l in header_text.split("\n")[3:8] if len(l.strip()) > 30]
        if candidate_summary_lines:
            summary = " ".join(candidate_summary_lines)

    # Certifications
    certifications = []
    cert_text = sections.get("certifications", "")
    if cert_text:
        cert_lines = [l.lstrip("•*-# >").strip() for l in cert_text.split("\n") if len(l.strip()) > 5]
        certifications = cert_lines[:6]

    extracted_data = ResumeExtractedData(
        name=name or "Candidate",
        email=email,
        phone=phone,
        location=location,
        summary=summary,
        education=education,
        skills=skills,
        experience=experience,
        projects=projects,
        certifications=certifications,
        links=links
    )

    return extracted_data, raw_text
