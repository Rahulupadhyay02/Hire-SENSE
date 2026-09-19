"""
Phase 10 — AI Evaluation Dataset
=================================
Standardized benchmark dataset with:
- 51 AI evaluation test cases (20 resumes, 15 job matches, 16 interview transcripts)
- 32 Human-vs-AI comparison cases with ground truth expert labels
"""

from typing import List, Dict, Any

# ══════════════════════════════════════════════════════════════════════════════
# PART 1: 20 RESUME AI TEST CASES (Diverse tech stacks, formats, seniorities)
# ══════════════════════════════════════════════════════════════════════════════

RESUME_EVALUATION_DATASET: List[Dict[str, Any]] = [
    {
        "id": "res_01",
        "title": "Senior Backend Engineer",
        "text": """
        Arjun Mehta | arjun.m@example.com | +91-9876543210 | Bengaluru, India
        Summary: Senior backend developer with 5+ years building distributed cloud APIs.
        Experience:
        Senior Software Engineer, Razorpay (2021 - Present)
        - Architected high-throughput payment microservices in Python, FastAPI, and PostgreSQL.
        - Deployed scalable worker clusters using Docker, Kubernetes, Celery, and Redis.
        Software Engineer, Infosys (2019 - 2021)
        - Developed REST APIs in Python and Django with MySQL.
        Education:
        B.Tech in Computer Science, IIT Bombay (2015 - 2019)
        Skills: Python, FastAPI, Django, PostgreSQL, Redis, Docker, Kubernetes, Celery, AWS, Git
        """,
        "expected_skills": ["Python", "FastAPI", "Django", "PostgreSQL", "Redis", "Docker", "Kubernetes", "Celery", "AWS", "Git"],
        "expected_exp_years": 5.0,
        "category": "senior_backend"
    },
    {
        "id": "res_02",
        "title": "Frontend React Specialist",
        "text": """
        Priya Sharma | priya.s@example.com | New Delhi, India
        Frontend Engineer with 3 years experience building responsive SPAs.
        Experience:
        Frontend Developer, Zomato (2023 - Present)
        - Built food ordering dashboard with React, TypeScript, Redux Toolkit, and Tailwind CSS.
        - Optimized page load metrics by 45% using Vite and code splitting.
        Junior Web Developer, Urban Company (2021 - 2023)
        - Created UI components in JavaScript, HTML5, CSS3, and React.
        Education: B.S. Information Technology, Delhi University (2021)
        Skills: React, JavaScript, TypeScript, HTML, CSS, Tailwind CSS, Redux, Vite, REST APIs
        """,
        "expected_skills": ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind CSS", "Redux", "Vite", "REST APIs"],
        "expected_exp_years": 3.0,
        "category": "frontend_react"
    },
    {
        "id": "res_03",
        "title": "Machine Learning Engineer",
        "text": """
        Kavita Patel | kavita.patel@example.com | Pune, India
        ML Engineer with 4 years deploying computer vision and NLP models into production.
        Experience:
        ML Engineer, Cognizant AI Labs (2022 - Present)
        - Fine-tuned transformer models using PyTorch, Hugging Face, and Python.
        - Built real-time inference APIs with FastAPI and Docker.
        Data Science Analyst, Fractal (2020 - 2022)
        - Data analysis and modeling using Scikit-Learn, Pandas, NumPy, and SQL.
        Education: M.Tech in Artificial Intelligence, BITS Pilani (2020)
        Skills: Python, PyTorch, Machine Learning, Deep Learning, NLP, FastAPI, Docker, SQL, Pandas
        """,
        "expected_skills": ["Python", "PyTorch", "Machine Learning", "Deep Learning", "NLP", "FastAPI", "Docker", "SQL", "Pandas"],
        "expected_exp_years": 4.0,
        "category": "ml_engineer"
    },
    {
        "id": "res_04",
        "title": "DevOps & Cloud Engineer",
        "text": """
        Rohan Das | rohan.devops@example.com | Hyderabad, India
        DevOps practitioner with 4.5 years managing AWS cloud infrastructure.
        Experience:
        Cloud Engineer, Wipro Cloud Practice (2021 - Present)
        - Automated CI/CD pipelines with GitHub Actions, Jenkins, and Terraform.
        - Managed multi-node Kubernetes clusters on AWS EKS and Docker containers.
        System Administrator, Tech Mahindra (2019 - 2021)
        - Linux server provisioning, Bash scripting, and Nginx reverse proxies.
        Education: B.E. Electronics and Communication (2019)
        Skills: AWS, Docker, Kubernetes, Terraform, CI/CD, Jenkins, GitHub Actions, Linux, Bash
        """,
        "expected_skills": ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Jenkins", "GitHub Actions", "Linux", "Bash"],
        "expected_exp_years": 4.5,
        "category": "devops_cloud"
    },
    {
        "id": "res_05",
        "title": "Fresher / Entry-Level Software Engineer",
        "text": """
        Sneha Reddy | sneha.reddy@example.com | Hyderabad, India
        Recent Computer Science graduate with strong algorithms foundation and project experience.
        Projects:
        - Hospital Management Portal: Built full stack app using Python, Django, SQLite, and React.
        - Algorithmic Trading Bot: Backtested momentum strategies using Pandas and NumPy.
        Education:
        B.Tech in Computer Science, Osmania University (Graduated May 2026, GPA: 8.8/10)
        Skills: Python, Java, Data Structures, Algorithms, SQL, Git, React, Django
        """,
        "expected_skills": ["Python", "Java", "Data Structures", "Algorithms", "SQL", "Git", "React", "Django"],
        "expected_exp_years": 0.5,
        "category": "entry_level"
    },
    {
        "id": "res_06",
        "title": "Full Stack MERN Developer",
        "text": """
        Vikram Joshi | vikram.j@example.com | Mumbai, India
        Full stack engineer with 3.5 years developing web applications in Node and React.
        Experience:
        Full Stack Engineer, Cleartrip (2022 - Present)
        - Engineered microservices using Node.js, Express, MongoDB, and TypeScript.
        - Built frontend flows with React and Next.js.
        Education: B.Sc. Computer Science, Mumbai University (2020)
        Skills: JavaScript, TypeScript, React, Next.js, Node.js, Express, MongoDB, Git
        """,
        "expected_skills": ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Express", "MongoDB", "Git"],
        "expected_exp_years": 3.5,
        "category": "full_stack_mern"
    },
    {
        "id": "res_07",
        "title": "Data Analyst / BI Specialist",
        "text": """
        Ananya Sen | ananya.sen@example.com | Kolkata, India
        Data Analyst with 2.5 years experience transforming raw data into business intelligence.
        Experience:
        Business Data Analyst, Swiggy (2023 - Present)
        - Developed executive Power BI and Tableau dashboards tracking cohort retention.
        - Automated SQL extraction scripts and Python data cleaning pipelines.
        Education: B.Com & PG Diploma in Business Analytics (2022)
        Skills: SQL, Python, Tableau, Power BI, Excel, Data Analysis, Pandas
        """,
        "expected_skills": ["SQL", "Python", "Tableau", "Power BI", "Excel", "Data Analysis", "Pandas"],
        "expected_exp_years": 2.5,
        "category": "data_analyst"
    },
    {
        "id": "res_08",
        "title": "Mobile Developer (Flutter / Android)",
        "text": """
        Harsh Verma | harsh.v@example.com | Bengaluru, India
        Mobile app developer with 3 years delivering cross-platform iOS and Android apps.
        Experience:
        Mobile Developer, PhonePe (2023 - Present)
        - Developed fintech mobile features using Flutter, Dart, and Kotlin.
        - Integrated secure biometric auth and REST API endpoints.
        Education: B.Tech Computer Science, PES University (2021)
        Skills: Flutter, Dart, Kotlin, Android, iOS, Firebase, Git, REST APIs
        """,
        "expected_skills": ["Flutter", "Dart", "Kotlin", "Android", "iOS", "Firebase", "Git", "REST APIs"],
        "expected_exp_years": 3.0,
        "category": "mobile_developer"
    },
    {
        "id": "res_09",
        "title": "QA Automation Engineer",
        "text": """
        Deepika Nair | deepika.nair@example.com | Chennai, India
        Software Development Engineer in Test (SDET) with 4 years in automated testing.
        Experience:
        SDET II, Zoho (2022 - Present)
        - Designed test automation frameworks with Selenium, Python, and PyTest.
        - Implemented API testing with Postman and Playwright in CI/CD pipeline.
        Education: B.Tech Information Technology, SRM University (2020)
        Skills: Python, Selenium, PyTest, Playwright, API Testing, Postman, CI/CD, JIRA
        """,
        "expected_skills": ["Python", "Selenium", "PyTest", "Playwright", "API Testing", "Postman", "CI/CD", "JIRA"],
        "expected_exp_years": 4.0,
        "category": "qa_automation"
    },
    {
        "id": "res_10",
        "title": "Golang Systems Engineer",
        "text": """
        Abhishek Gupta | abhi.gupta@example.com | Gurugram, India
        Systems programmer with 5 years building concurrent microservices in Go.
        Experience:
        Backend Systems Engineer, InMobi (2021 - Present)
        - Engineered low-latency ad bidding engine processing 100k QPS using Golang and Kafka.
        - Deployed on Kubernetes and monitored with Prometheus and Grafana.
        Education: B.Tech Computer Science, NIT Kurukshetra (2019)
        Skills: Go, Golang, Kafka, Kubernetes, Docker, gRPC, PostgreSQL, Redis, Prometheus
        """,
        "expected_skills": ["Go", "Golang", "Kafka", "Kubernetes", "Docker", "gRPC", "PostgreSQL", "Redis", "Prometheus"],
        "expected_exp_years": 5.0,
        "category": "golang_systems"
    },
    {
        "id": "res_11",
        "title": "Cybersecurity / SecOps Analyst",
        "text": """
        Zaid Khan | zaid.sec@example.com | Bengaluru, India
        Information security engineer with 3.5 years in vulnerability assessment and cloud security.
        Skills: Cybersecurity, Penetration Testing, Wireshark, Linux, Python, AWS, SIEM, OWASP
        Experience: Security Analyst, TCS Cyber Defense (2022 - Present) - 3.5 years.
        Education: B.Tech CSE, Amity University (2021)
        """,
        "expected_skills": ["Cybersecurity", "Penetration Testing", "Wireshark", "Linux", "Python", "AWS", "SIEM", "OWASP"],
        "expected_exp_years": 3.5,
        "category": "cybersecurity"
    },
    {
        "id": "res_12",
        "title": "Java Spring Boot Enterprise Developer",
        "text": """
        Manoj Tiwari | manoj.t@example.com | Noida, India
        Enterprise software engineer with 6 years building banking backend solutions.
        Skills: Java, Spring Boot, Microservices, Hibernate, Oracle, Kafka, Docker, Maven
        Experience: Lead Engineer, HDFC Bank Tech (2020 - Present) - 6 years.
        Education: B.Tech Computer Science (2018)
        """,
        "expected_skills": ["Java", "Spring Boot", "Microservices", "Hibernate", "Oracle", "Kafka", "Docker", "Maven"],
        "expected_exp_years": 6.0,
        "category": "java_enterprise"
    },
    {
        "id": "res_13",
        "title": "Cloud Data Architect",
        "text": """
        Pooja Deshmukh | pooja.d@example.com | Pune, India
        Data architect with 7 years designing petabyte-scale data lakes.
        Skills: Python, Spark, Snowflake, AWS, Databricks, SQL, Airflow, Kafka
        Experience: Principal Data Architect, Persistent Systems (2019 - Present) - 7 years.
        Education: M.S. Data Engineering (2017)
        """,
        "expected_skills": ["Python", "Spark", "Snowflake", "AWS", "Databricks", "SQL", "Airflow", "Kafka"],
        "expected_exp_years": 7.0,
        "category": "data_architect"
    },
    {
        "id": "res_14",
        "title": "UI/UX & Frontend Designer",
        "text": """
        Tanvi Shah | tanvi.design@example.com | Ahmedabad, India
        Product designer and frontend coder with 3 years crafting user-centered SaaS experiences.
        Skills: Figma, UI/UX, React, CSS, HTML, Tailwind CSS, JavaScript
        Experience: UI/UX Specialist, BrowserStack (2023 - Present) - 3 years.
        Education: B.Des National Institute of Design (2021)
        """,
        "expected_skills": ["Figma", "UI/UX", "React", "CSS", "HTML", "Tailwind CSS", "JavaScript"],
        "expected_exp_years": 3.0,
        "category": "ui_ux_frontend"
    },
    {
        "id": "res_15",
        "title": "Embedded & IoT Firmware Engineer",
        "text": """
        Gaurav Singhal | gaurav.s@example.com | Bengaluru, India
        Embedded engineer with 4 years programming microcontrollers and IoT sensors.
        Skills: C, C++, Embedded Systems, RTOS, Linux, IoT, Python, Git
        Experience: Firmware Engineer, Ather Energy (2022 - Present) - 4 years.
        Education: B.Tech Electrical Engineering (2020)
        """,
        "expected_skills": ["C", "C++", "Embedded Systems", "RTOS", "Linux", "IoT", "Python", "Git"],
        "expected_exp_years": 4.0,
        "category": "embedded_iot"
    },
    {
        "id": "res_16",
        "title": "Blockchain & Web3 Developer",
        "text": """
        Nikhil Varma | nikhil.eth@example.com | Goa, India
        Smart contract developer with 3 years building EVM protocols.
        Skills: Solidity, Ethereum, Web3, JavaScript, TypeScript, React, Node.js
        Experience: Smart Contract Engineer, Polygon (2023 - Present) - 3 years.
        Education: B.E. Computer Engineering (2021)
        """,
        "expected_skills": ["Solidity", "Ethereum", "Web3", "JavaScript", "TypeScript", "React", "Node.js"],
        "expected_exp_years": 3.0,
        "category": "blockchain"
    },
    {
        "id": "res_17",
        "title": "Career Switcher (Mechanical to Python Developer)",
        "text": """
        Rahul Nair | rahul.nair@example.com | Kochi, India
        Transitioning mechanical engineer with 1.5 years self-directed and project-based Python development.
        Skills: Python, Django, SQL, Git, Linux, Pandas
        Experience: Software Trainee, Tech I/O (2024 - Present) - 1.5 years.
        Education: B.Tech Mechanical Engineering (2022)
        """,
        "expected_skills": ["Python", "Django", "SQL", "Git", "Linux", "Pandas"],
        "expected_exp_years": 1.5,
        "category": "career_switcher"
    },
    {
        "id": "res_18",
        "title": "Site Reliability Engineer (SRE)",
        "text": """
        Bhavna Sen | bhavna.sre@example.com | Mumbai, India
        SRE with 5 years managing reliability, latency, and incident response for financial gateways.
        Skills: Python, Go, Kubernetes, Terraform, Prometheus, Grafana, AWS, Linux, CI/CD
        Experience: SRE II, PayU (2021 - Present) - 5 years.
        Education: B.Tech Computer Science (2019)
        """,
        "expected_skills": ["Python", "Go", "Kubernetes", "Terraform", "Prometheus", "Grafana", "AWS", "Linux", "CI/CD"],
        "expected_exp_years": 5.0,
        "category": "sre"
    },
    {
        "id": "res_19",
        "title": "Natural Language Processing Researcher",
        "text": """
        Dr. Siddharth Rao | siddharth.nlp@example.com | Bengaluru, India
        NLP researcher with 4 years training LLMs, semantic search engines, and embedding pipelines.
        Skills: Python, PyTorch, NLP, Machine Learning, Transformers, Hugging Face, FastText, SQL
        Experience: Senior Applied Scientist, Microsoft Research (2022 - Present) - 4 years.
        Education: Ph.D. in Computer Science, IISc Bangalore (2022)
        """,
        "expected_skills": ["Python", "PyTorch", "NLP", "Machine Learning", "Transformers", "Hugging Face", "SQL"],
        "expected_exp_years": 4.0,
        "category": "nlp_researcher"
    },
    {
        "id": "res_20",
        "title": "Noisy Formatted Resume (Edge Case)",
        "text": """
        *** RESUME ***
        NAME: J. DOE | EMAIL: JDOE@TEST.ORG | PHONE: +1 999 000 1111
        TECHNICAL SUMMARY ::: Python3, PostgreSQL, FastAPI, Docker, and AWS.
        WORK HISTORY :::
        * Worked at ABC Corp from 2022 to 2024 (2 yrs) doing Python and FastAPI backend APIs.
        * Built PostgreSQL databases with Docker containerization.
        DEGREE ::: BS Computer Information Systems (2022)
        """,
        "expected_skills": ["Python", "PostgreSQL", "FastAPI", "Docker", "AWS"],
        "expected_exp_years": 2.0,
        "category": "noisy_edge_case"
    }
]


# ══════════════════════════════════════════════════════════════════════════════
# PART 2: 15 JOB-CANDIDATE MATCHING SCENARIOS
# ══════════════════════════════════════════════════════════════════════════════

MATCHING_EVALUATION_DATASET: List[Dict[str, Any]] = [
    {
        "id": "match_01",
        "scenario": "Perfect Fit Python Senior Engineer",
        "job_req_skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
        "job_pref_skills": ["Redis", "Kubernetes"],
        "job_exp": "3+ years",
        "candidate_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis", "Kubernetes"],
        "candidate_exp": "4.5 years",
        "expected_score_min": 85.0,
        "expected_score_max": 100.0,
        "expected_missing_count": 0
    },
    {
        "id": "match_02",
        "scenario": "Missing 1 Required Skill (PostgreSQL)",
        "job_req_skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
        "job_pref_skills": ["Redis"],
        "job_exp": "2+ years",
        "candidate_skills": ["Python", "FastAPI", "Docker", "MongoDB"],
        "candidate_exp": "3.0 years",
        "expected_score_min": 65.0,
        "expected_score_max": 82.0,
        "expected_missing_count": 1
    },
    {
        "id": "match_03",
        "scenario": "Junior Applying for Senior Role (Experience Deficit)",
        "job_req_skills": ["Python", "Django", "PostgreSQL"],
        "job_pref_skills": ["AWS"],
        "job_exp": "5+ years",
        "candidate_skills": ["Python", "Django", "PostgreSQL"],
        "candidate_exp": "1.0 years",
        "expected_score_min": 50.0,
        "expected_score_max": 75.0,
        "expected_missing_count": 0
    },
    {
        "id": "match_04",
        "scenario": "Frontend Specialist Applying for Backend Python Role (Domain Mismatch)",
        "job_req_skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
        "job_pref_skills": ["Celery"],
        "job_exp": "3 years",
        "candidate_skills": ["React", "HTML", "CSS", "Figma", "JavaScript"],
        "candidate_exp": "3.0 years",
        "expected_score_min": 20.0,
        "expected_score_max": 45.0,
        "expected_missing_count": 4
    },
    {
        "id": "match_05",
        "scenario": "Overqualified Candidate (7 Years applying for 2 Years Role)",
        "job_req_skills": ["React", "TypeScript", "CSS"],
        "job_pref_skills": ["Next.js"],
        "job_exp": "2+ years",
        "candidate_skills": ["React", "TypeScript", "CSS", "Next.js", "Node.js", "AWS", "Docker"],
        "candidate_exp": "7.0 years",
        "expected_score_min": 85.0,
        "expected_score_max": 100.0,
        "expected_missing_count": 0
    },
    {
        "id": "match_06",
        "scenario": "Data Science ML Match",
        "job_req_skills": ["Python", "PyTorch", "Machine Learning", "SQL"],
        "job_pref_skills": ["NLP", "FastAPI"],
        "job_exp": "3+ years",
        "candidate_skills": ["Python", "PyTorch", "Machine Learning", "SQL", "Pandas", "NLP"],
        "candidate_exp": "4.0 years",
        "expected_score_min": 85.0,
        "expected_score_max": 100.0,
        "expected_missing_count": 0
    },
    {
        "id": "match_07",
        "scenario": "Missing All Preferred Skills but All Required Skills Present",
        "job_req_skills": ["Java", "Spring Boot", "SQL"],
        "job_pref_skills": ["Kafka", "Docker", "Kubernetes", "AWS"],
        "job_exp": "3 years",
        "candidate_skills": ["Java", "Spring Boot", "SQL"],
        "candidate_exp": "3.5 years",
        "expected_score_min": 70.0,
        "expected_score_max": 85.0,
        "expected_missing_count": 0
    },
    {
        "id": "match_08",
        "scenario": "DevOps Candidate with AWS, Terraform and Kubernetes",
        "job_req_skills": ["AWS", "Terraform", "Kubernetes"],
        "job_pref_skills": ["CI/CD"],
        "job_exp": "4 years",
        "candidate_skills": ["AWS", "Terraform", "Kubernetes", "CI/CD", "Linux"],
        "candidate_exp": "4.5 years",
        "expected_score_min": 85.0,
        "expected_score_max": 100.0,
        "expected_missing_count": 0
    },
    {
        "id": "match_09",
        "scenario": "Full Stack Engineer Matching 4 of 5 Required Skills",
        "job_req_skills": ["React", "Node.js", "TypeScript", "PostgreSQL", "GraphQL"],
        "job_pref_skills": ["Docker"],
        "job_exp": "3 years",
        "candidate_skills": ["React", "Node.js", "TypeScript", "PostgreSQL"],
        "candidate_exp": "3.0 years",
        "expected_score_min": 70.0,
        "expected_score_max": 85.0,
        "expected_missing_count": 1
    },
    {
        "id": "match_10",
        "scenario": "Complete Zero Fit Candidate",
        "job_req_skills": ["Go", "Kubernetes", "gRPC", "Prometheus"],
        "job_pref_skills": ["C++"],
        "job_exp": "4 years",
        "candidate_skills": ["Photoshop", "Content Writing", "SEO", "Copywriting"],
        "candidate_exp": "1.0 years",
        "expected_score_min": 0.0,
        "expected_score_max": 30.0,
        "expected_missing_count": 4
    },
    {
        "id": "match_11",
        "scenario": "Mobile Flutter Engineer Fit",
        "job_req_skills": ["Flutter", "Dart", "REST APIs"],
        "job_pref_skills": ["Firebase", "iOS"],
        "job_exp": "2+ years",
        "candidate_skills": ["Flutter", "Dart", "REST APIs", "Firebase", "Android"],
        "candidate_exp": "3.0 years",
        "expected_score_min": 80.0,
        "expected_score_max": 98.0,
        "expected_missing_count": 0
    },
    {
        "id": "match_12",
        "scenario": "QA Automation SDET Match",
        "job_req_skills": ["Python", "Selenium", "PyTest"],
        "job_pref_skills": ["Playwright", "CI/CD"],
        "job_exp": "3 years",
        "candidate_skills": ["Python", "Selenium", "PyTest", "CI/CD"],
        "candidate_exp": "4.0 years",
        "expected_score_min": 82.0,
        "expected_score_max": 98.0,
        "expected_missing_count": 0
    },
    {
        "id": "match_13",
        "scenario": "Cybersecurity Analyst Moderate Fit",
        "job_req_skills": ["Cybersecurity", "Penetration Testing", "Linux", "SIEM"],
        "job_pref_skills": ["Python"],
        "job_exp": "3+ years",
        "candidate_skills": ["Cybersecurity", "Linux", "Python"],
        "candidate_exp": "2.0 years",
        "expected_score_min": 55.0,
        "expected_score_max": 75.0,
        "expected_missing_count": 2
    },
    {
        "id": "match_14",
        "scenario": "Data Engineer Partial Skill Match with SQL & Python",
        "job_req_skills": ["Python", "SQL", "Spark", "Airflow"],
        "job_pref_skills": ["Snowflake"],
        "job_exp": "3+ years",
        "candidate_skills": ["Python", "SQL", "Pandas"],
        "candidate_exp": "2.5 years",
        "expected_score_min": 50.0,
        "expected_score_max": 72.0,
        "expected_missing_count": 2
    },
    {
        "id": "match_15",
        "scenario": "Cloud Architect with Extensive Experience",
        "job_req_skills": ["AWS", "Terraform", "Docker"],
        "job_pref_skills": ["Kubernetes", "Python"],
        "job_exp": "5+ years",
        "candidate_skills": ["AWS", "Terraform", "Docker", "Kubernetes", "Python", "Linux"],
        "candidate_exp": "6.5 years",
        "expected_score_min": 85.0,
        "expected_score_max": 100.0,
        "expected_missing_count": 0
    }
]


# ══════════════════════════════════════════════════════════════════════════════
# PART 3: 16 INTERVIEW TRANSCRIPT INTELLIGENCE CASES
# ══════════════════════════════════════════════════════════════════════════════

INTERVIEW_EVALUATION_DATASET: List[Dict[str, Any]] = [
    {
        "id": "iv_01",
        "title": "Exemplary STAR Technical Response",
        "transcript": """
        When I was working at my previous company as a backend engineer, we experienced 
        severe latency spikes on our payment processing endpoints. My role was to investigate 
        and resolve the bottleneck. The goal was to decrease latency by forty percent. 
        I implemented an asynchronous worker queue using Celery and Redis and optimized the 
        PostgreSQL database queries with indexing. As a result, we successfully reduced average 
        latency from 450 milliseconds to 45 milliseconds, and our system throughput doubled.
        """,
        "duration_seconds": 38.0,
        "job_skills": ["Python", "PostgreSQL", "Redis", "Celery"],
        "expected_wpm_range": (110, 160),
        "expected_filler_max": 2.0,
        "expected_score_min": 80.0,
        "has_star": True
    },
    {
        "id": "iv_02",
        "title": "High Filler Words Response",
        "transcript": """
        Um, basically, uh, like I was trying to, you know, fix the bug, and like, 
        umm, actually it was kind of hard, right? So, uh, I just sort of restarted the server, 
        and like, you know what I mean, it worked for a bit, but then, um, it crashed again.
        """,
        "duration_seconds": 22.0,
        "job_skills": ["Python"],
        "expected_wpm_range": (80, 150),
        "expected_filler_max": 25.0,
        "expected_score_min": 30.0,
        "has_star": False
    },
    {
        "id": "iv_03",
        "title": "Rushed Fast Speaking Pace (> 175 WPM)",
        "transcript": """
        So what happened was we had this huge outage on Friday night and the servers were going down 
        and everyone was panicking so I jumped on the bridge and started looking at the logs and saw that 
        the database connection pool was exhausted so I immediately bumped up the max connections and 
        recycled the pods and everything came back online within about seven minutes which saved the company 
        thousands of dollars in downtime.
        """,
        "duration_seconds": 18.0,
        "job_skills": ["Docker", "Kubernetes"],
        "expected_wpm_range": (170, 240),
        "expected_filler_max": 3.0,
        "expected_score_min": 60.0,
        "has_star": False
    },
    {
        "id": "iv_04",
        "title": "Slow Deliberate Speaking Pace (< 95 WPM)",
        "transcript": """
        In my view ... architecture matters. When designing software ... we must prioritize ... 
        simplicity ... and modularity. I prefer ... clean code.
        """,
        "duration_seconds": 25.0,
        "job_skills": ["Software Architecture"],
        "expected_wpm_range": (40, 95),
        "expected_filler_max": 2.0,
        "expected_score_min": 45.0,
        "has_star": False
    },
    {
        "id": "iv_05",
        "title": "Strong Relevance with Domain Keywords",
        "transcript": """
        In my role at TechCorp, I built a machine learning pipeline using Python, PyTorch, and Docker. 
        I trained transformer models for NLP classification, evaluated them with precision and recall, 
        and deployed the microservice using FastAPI on AWS.
        """,
        "duration_seconds": 24.0,
        "job_skills": ["Python", "PyTorch", "NLP", "FastAPI", "Docker", "AWS"],
        "expected_wpm_range": (110, 155),
        "expected_filler_max": 2.0,
        "expected_score_min": 80.0,
        "has_star": True
    },
    {
        "id": "iv_06",
        "title": "Irrelevant Answer (Zero Skill Mention)",
        "transcript": """
        Well, I really enjoy traveling and playing guitar in my spare time. Last summer I went hiking 
        in the Himalayas and it was an incredible experience that taught me a lot about perseverance 
        and appreciating nature.
        """,
        "duration_seconds": 22.0,
        "job_skills": ["React", "TypeScript", "Node.js"],
        "expected_wpm_range": (100, 150),
        "expected_filler_max": 3.0,
        "expected_score_min": 35.0,
        "has_star": False
    },
    {
        "id": "iv_07",
        "title": "Candidate Improvement Attempt (Baseline Attempt 1)",
        "transcript": """
        Um, so basically at my last job, uh, I had to like, write some SQL queries. 
        And, uh, it was kind of slow, so um, I just added an index, right?
        """,
        "duration_seconds": 20.0,
        "job_skills": ["SQL", "PostgreSQL"],
        "expected_wpm_range": (80, 130),
        "expected_filler_max": 20.0,
        "expected_score_min": 40.0,
        "has_star": False
    },
    {
        "id": "iv_08",
        "title": "Candidate Improvement Attempt (Practiced Attempt 2)",
        "transcript": """
        In my project at my previous company, my task was to optimize an analytics dashboard. 
        I wrote optimized SQL queries on PostgreSQL and created composite indexes. 
        As a result, query execution time dropped by sixty percent.
        """,
        "duration_seconds": 20.0,
        "job_skills": ["SQL", "PostgreSQL"],
        "expected_wpm_range": (110, 150),
        "expected_filler_max": 2.0,
        "expected_score_min": 82.0,
        "has_star": True
    },
    {
        "id": "iv_09",
        "title": "DevOps Incident Response Narrative",
        "transcript": """
        When I was an SRE at CloudScale, our Kubernetes cluster ran out of memory during a flash sale. 
        My task was to stabilize the production cluster. I configured Horizontal Pod Autoscaling and 
        adjusted memory limits in Terraform. As a result, the service stayed at ninety-nine point nine 
        nine percent uptime throughout the peak traffic.
        """,
        "duration_seconds": 26.0,
        "job_skills": ["Kubernetes", "Terraform", "SRE"],
        "expected_wpm_range": (110, 160),
        "expected_filler_max": 2.0,
        "expected_score_min": 82.0,
        "has_star": True
    },
    {
        "id": "iv_10",
        "title": "Repetitive Filler Phrasing ('You Know')",
        "transcript": """
        You know, when you work on React, you know, it has hooks, and you know what I mean, 
        state management is, you know, tricky. You know, we used Redux and you know, it worked.
        """,
        "duration_seconds": 18.0,
        "job_skills": ["React", "Redux"],
        "expected_wpm_range": (100, 150),
        "expected_filler_max": 22.0,
        "expected_score_min": 40.0,
        "has_star": False
    },
    {
        "id": "iv_11",
        "title": "Security Architecture Explanation",
        "transcript": """
        In our fintech application, I was responsible for securing user authentication. 
        I built an OAuth2 and JWT authentication service with rate limiting in Redis and hashed 
        passwords using bcrypt. As a result, our security audit passed with zero critical vulnerabilities.
        """,
        "duration_seconds": 22.0,
        "job_skills": ["Security", "Redis", "JWT"],
        "expected_wpm_range": (110, 155),
        "expected_filler_max": 2.0,
        "expected_score_min": 84.0,
        "has_star": True
    },
    {
        "id": "iv_12",
        "title": "Front-End Performance Optimization",
        "transcript": """
        Working at my previous startup, the frontend bundle size was exceeding five megabytes. 
        My goal was to decrease the initial page load time. I refactored our React codebase with 
        dynamic imports, code splitting, and lazy loading. As a result, the initial bundle was reduced 
        to eight hundred kilobytes and Lighthouse score improved to ninety-two.
        """,
        "duration_seconds": 28.0,
        "job_skills": ["React", "JavaScript"],
        "expected_wpm_range": (115, 155),
        "expected_filler_max": 2.0,
        "expected_score_min": 84.0,
        "has_star": True
    },
    {
        "id": "iv_13",
        "title": "Brief One-Line Answer",
        "transcript": "Yes, I know Python and SQL.",
        "duration_seconds": 4.0,
        "job_skills": ["Python", "SQL"],
        "expected_wpm_range": (70, 130),
        "expected_filler_max": 0.0,
        "expected_score_min": 30.0,
        "has_star": False
    },
    {
        "id": "iv_14",
        "title": "Microservices Migration with Golang",
        "transcript": """
        In a project at my company, we were migrating a monolithic system to microservices. 
        I designed and built three gRPC services in Golang with Kafka message streams. 
        As a result, system throughput increased threefold and deployment cycle dropped to ten minutes.
        """,
        "duration_seconds": 22.0,
        "job_skills": ["Go", "Golang", "Kafka", "gRPC"],
        "expected_wpm_range": (110, 155),
        "expected_filler_max": 2.0,
        "expected_score_min": 84.0,
        "has_star": True
    },
    {
        "id": "iv_15",
        "title": "Data Pipeline Reliability STAR",
        "transcript": """
        When I was working as a data engineer, our daily batch ETL jobs frequently failed due to schema drifts. 
        My task was to build a resilient ingestion pipeline. I used Apache Airflow and PySpark with 
        automated Great Expectations data validations. As a result, pipeline pipeline failures dropped 
        from four times a week to zero.
        """,
        "duration_seconds": 26.0,
        "job_skills": ["Python", "Spark", "Airflow"],
        "expected_wpm_range": (110, 155),
        "expected_filler_max": 2.0,
        "expected_score_min": 84.0,
        "has_star": True
    },
    {
        "id": "iv_16",
        "title": "Vague Passive Technical Answer",
        "transcript": """
        Things were done using various technologies. Tools were utilized to achieve the targets 
        and requirements were satisfied according to documentation.
        """,
        "duration_seconds": 15.0,
        "job_skills": ["Python", "React"],
        "expected_wpm_range": (70, 140),
        "expected_filler_max": 0.0,
        "expected_score_min": 35.0,
        "has_star": False
    }
]


# ══════════════════════════════════════════════════════════════════════════════
# PART 4: 32 HUMAN-VS-AI COMPARISON CASES (Ground truth human expert scores)
# ══════════════════════════════════════════════════════════════════════════════

HUMAN_VS_AI_COMPARISON_DATASET: List[Dict[str, Any]] = [
    # Paired human expert evaluations with interview transcripts
    {
        "case_id": "h_ai_01",
        "transcript": "When I was at Razorpay, my task was to scale our API. I built Redis caching and PostgreSQL indexes. As a result, latency dropped 50%.",
        "duration_seconds": 15.0,
        "job_skills": ["Redis", "PostgreSQL", "Python"],
        "human_overall_score": 85.0,
        "human_structure_score": 90.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 85.0
    },
    {
        "case_id": "h_ai_02",
        "transcript": "Um, basically, uh, I did some, you know, Python coding, like, on my laptop.",
        "duration_seconds": 10.0,
        "job_skills": ["Python"],
        "human_overall_score": 42.0,
        "human_structure_score": 25.0,
        "human_filler_rate": 28.0,
        "human_relevance_score": 50.0
    },
    {
        "case_id": "h_ai_03",
        "transcript": "In my project, my goal was to build a React dashboard. I implemented Tailwind and Vite. As a result, page speed increased by 30%.",
        "duration_seconds": 14.0,
        "job_skills": ["React", "Vite", "Tailwind CSS"],
        "human_overall_score": 86.0,
        "human_structure_score": 88.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 88.0
    },
    {
        "case_id": "h_ai_04",
        "transcript": "I like computers and I have always been fascinated by software.",
        "duration_seconds": 8.0,
        "job_skills": ["Java", "Spring Boot"],
        "human_overall_score": 35.0,
        "human_structure_score": 20.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 10.0
    },
    {
        "case_id": "h_ai_05",
        "transcript": "When I was working at Infosys, we needed to migrate to AWS. I wrote Terraform scripts and Dockerized the containers. As a result, deployment time fell by half.",
        "duration_seconds": 18.0,
        "job_skills": ["AWS", "Terraform", "Docker"],
        "human_overall_score": 88.0,
        "human_structure_score": 92.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 90.0
    },
    {
        "case_id": "h_ai_06",
        "transcript": "Uh, well, you know, Docker is like, containers, right? And so, uh, you sort of run things.",
        "duration_seconds": 11.0,
        "job_skills": ["Docker"],
        "human_overall_score": 40.0,
        "human_structure_score": 25.0,
        "human_filler_rate": 25.0,
        "human_relevance_score": 55.0
    },
    {
        "case_id": "h_ai_07",
        "transcript": "In our team at Swiggy, our role was to prevent fraud. I trained an XGBoost model in Python and deployed it on FastAPI. As a result, fraudulent transactions decreased 25%.",
        "duration_seconds": 17.0,
        "job_skills": ["Python", "Machine Learning", "FastAPI"],
        "human_overall_score": 87.0,
        "human_structure_score": 90.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 88.0
    },
    {
        "case_id": "h_ai_08",
        "transcript": "We used git and wrote some code and it worked.",
        "duration_seconds": 6.0,
        "job_skills": ["Git", "Python"],
        "human_overall_score": 45.0,
        "human_structure_score": 30.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 45.0
    },
    {
        "case_id": "h_ai_09",
        "transcript": "When I was at Zomato, my responsibility was mobile UI performance. I rebuilt the cart screen in Flutter and Dart. As a result, frame drops decreased by 40%.",
        "duration_seconds": 16.0,
        "job_skills": ["Flutter", "Dart"],
        "human_overall_score": 86.0,
        "human_structure_score": 90.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 85.0
    },
    {
        "case_id": "h_ai_10",
        "transcript": "So, um, basically, Flutter, you know, makes apps, right? And like, it's pretty cool.",
        "duration_seconds": 9.0,
        "job_skills": ["Flutter"],
        "human_overall_score": 38.0,
        "human_structure_score": 20.0,
        "human_filler_rate": 25.0,
        "human_relevance_score": 45.0
    },
    {
        "case_id": "h_ai_11",
        "transcript": "In my previous role, I was responsible for database reliability. I configured PostgreSQL streaming replication and automated backups. As a result, RPO was reduced to zero.",
        "duration_seconds": 16.0,
        "job_skills": ["PostgreSQL", "Database"],
        "human_overall_score": 87.0,
        "human_structure_score": 90.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 88.0
    },
    {
        "case_id": "h_ai_12",
        "transcript": "Postgres is a relational database and it uses SQL for queries.",
        "duration_seconds": 7.0,
        "job_skills": ["PostgreSQL", "SQL"],
        "human_overall_score": 50.0,
        "human_structure_score": 30.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 65.0
    },
    {
        "case_id": "h_ai_13",
        "transcript": "When working at Flipkart, our task was to redesign the catalog microservice. I rewrote the core engine in Go with gRPC. As a result, memory consumption dropped by 65%.",
        "duration_seconds": 17.0,
        "job_skills": ["Go", "gRPC", "Microservices"],
        "human_overall_score": 89.0,
        "human_structure_score": 92.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 90.0
    },
    {
        "case_id": "h_ai_14",
        "transcript": "Like, Go is fast, um, and you know, Google made it, right? So we sort of used it.",
        "duration_seconds": 10.0,
        "job_skills": ["Go"],
        "human_overall_score": 38.0,
        "human_structure_score": 20.0,
        "human_filler_rate": 25.0,
        "human_relevance_score": 50.0
    },
    {
        "case_id": "h_ai_15",
        "transcript": "In my internship, the goal was to automate regression tests. I implemented Selenium with PyTest in our GitHub Actions pipeline. As a result, test execution was automated completely.",
        "duration_seconds": 16.0,
        "job_skills": ["Python", "Selenium", "PyTest", "GitHub Actions"],
        "human_overall_score": 85.0,
        "human_structure_score": 88.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 88.0
    },
    {
        "case_id": "h_ai_16",
        "transcript": "Testing is important so bugs do not go to production.",
        "duration_seconds": 6.0,
        "job_skills": ["Testing", "QA"],
        "human_overall_score": 42.0,
        "human_structure_score": 25.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 50.0
    },
    {
        "case_id": "h_ai_17",
        "transcript": "When I was working on our security audit, my task was to identify vulnerabilities. I ran OWASP ZAP and remediated SQL injections. As a result, our compliance score reached 100%.",
        "duration_seconds": 17.0,
        "job_skills": ["Cybersecurity", "OWASP", "SQL"],
        "human_overall_score": 87.0,
        "human_structure_score": 90.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 85.0
    },
    {
        "case_id": "h_ai_18",
        "transcript": "Um, cybersecurity is like, stopping hackers, you know what I mean, basically firewalls.",
        "duration_seconds": 9.0,
        "job_skills": ["Cybersecurity"],
        "human_overall_score": 36.0,
        "human_structure_score": 20.0,
        "human_filler_rate": 30.0,
        "human_relevance_score": 45.0
    },
    {
        "case_id": "h_ai_19",
        "transcript": "In my project at university, we needed to forecast energy consumption. I implemented an LSTM network in PyTorch. As a result, mean squared error was reduced by 18%.",
        "duration_seconds": 16.0,
        "job_skills": ["PyTorch", "Deep Learning", "Python"],
        "human_overall_score": 84.0,
        "human_structure_score": 88.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 85.0
    },
    {
        "case_id": "h_ai_20",
        "transcript": "Deep learning uses neural networks with many hidden layers.",
        "duration_seconds": 6.0,
        "job_skills": ["Deep Learning"],
        "human_overall_score": 48.0,
        "human_structure_score": 25.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 60.0
    },
    {
        "case_id": "h_ai_21",
        "transcript": "When I worked on our data pipeline, our goal was to process streaming logs. I set up Kafka topics with Spark Streaming. As a result, analytics delays decreased from 1 hour to 5 seconds.",
        "duration_seconds": 17.0,
        "job_skills": ["Kafka", "Spark", "Data Engineering"],
        "human_overall_score": 88.0,
        "human_structure_score": 92.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 90.0
    },
    {
        "case_id": "h_ai_22",
        "transcript": "Uh, Kafka is like, a queue, right? You know, messages go in, messages go out.",
        "duration_seconds": 9.0,
        "job_skills": ["Kafka"],
        "human_overall_score": 38.0,
        "human_structure_score": 20.0,
        "human_filler_rate": 20.0,
        "human_relevance_score": 50.0
    },
    {
        "case_id": "h_ai_23",
        "transcript": "In our cloud team, my role was cost optimization. I audited our AWS infrastructure and configured autoscaling. As a result, monthly AWS expenditure dropped by 35%.",
        "duration_seconds": 15.0,
        "job_skills": ["AWS", "Cloud"],
        "human_overall_score": 86.0,
        "human_structure_score": 88.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 85.0
    },
    {
        "case_id": "h_ai_24",
        "transcript": "AWS has EC2 and S3 for virtual machines and cloud storage.",
        "duration_seconds": 6.0,
        "job_skills": ["AWS"],
        "human_overall_score": 46.0,
        "human_structure_score": 25.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 60.0
    },
    {
        "case_id": "h_ai_25",
        "transcript": "When I was developing our GraphQL API, my task was to solve the N+1 query issue. I implemented DataLoader in Node.js. As a result, database queries per request dropped from 50 to 2.",
        "duration_seconds": 17.0,
        "job_skills": ["Node.js", "GraphQL", "API"],
        "human_overall_score": 88.0,
        "human_structure_score": 90.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 88.0
    },
    {
        "case_id": "h_ai_26",
        "transcript": "Like, GraphQL is like, REST, but you know, you choose the fields, right?",
        "duration_seconds": 8.0,
        "job_skills": ["GraphQL"],
        "human_overall_score": 39.0,
        "human_structure_score": 20.0,
        "human_filler_rate": 28.0,
        "human_relevance_score": 55.0
    },
    {
        "case_id": "h_ai_27",
        "transcript": "In our backend system, I needed to implement idempotency for payments. I used Redis distributed locks with FastAPI. As a result, double charges were reduced to zero.",
        "duration_seconds": 16.0,
        "job_skills": ["FastAPI", "Redis", "Python"],
        "human_overall_score": 87.0,
        "human_structure_score": 90.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 88.0
    },
    {
        "case_id": "h_ai_28",
        "transcript": "Redis is an in-memory cache and it is very fast for key-value lookups.",
        "duration_seconds": 7.0,
        "job_skills": ["Redis"],
        "human_overall_score": 50.0,
        "human_structure_score": 25.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 65.0
    },
    {
        "case_id": "h_ai_29",
        "transcript": "When I was leading our DevOps effort, we needed faster release cycles. I established a GitHub Actions workflow with Docker builds. As a result, release frequency grew from weekly to daily.",
        "duration_seconds": 17.0,
        "job_skills": ["DevOps", "Docker", "GitHub Actions"],
        "human_overall_score": 88.0,
        "human_structure_score": 92.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 88.0
    },
    {
        "case_id": "h_ai_30",
        "transcript": "Um, so like, CI/CD means, you know, continuous integration and deployment.",
        "duration_seconds": 7.0,
        "job_skills": ["CI/CD"],
        "human_overall_score": 38.0,
        "human_structure_score": 20.0,
        "human_filler_rate": 30.0,
        "human_relevance_score": 50.0
    },
    {
        "case_id": "h_ai_31",
        "transcript": "In my last team, our goal was to support internationalization. I refactored our React state with i18next. As a result, our platform successfully launched in four new languages.",
        "duration_seconds": 15.0,
        "job_skills": ["React", "JavaScript"],
        "human_overall_score": 84.0,
        "human_structure_score": 88.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 82.0
    },
    {
        "case_id": "h_ai_32",
        "transcript": "React is a JavaScript library for building user interfaces.",
        "duration_seconds": 5.0,
        "job_skills": ["React"],
        "human_overall_score": 45.0,
        "human_structure_score": 25.0,
        "human_filler_rate": 0.0,
        "human_relevance_score": 60.0
    }
]
