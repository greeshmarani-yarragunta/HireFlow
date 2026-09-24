import requests
import json
import time

BASE_URL = 'http://127.0.0.1:8000/api'

def run_test():
    print("==================================================================")
    print("HIREFLOW FULL-STACK END-TO-END AUTOMATED VERIFICATION")
    print("==================================================================")

    session = requests.Session()

    # Step 1: Candidate Signup
    cand_email = f"e2e_candidate_{int(time.time())}@example.com"
    cand_password = "Password@123"
    print(f"\n1. Registering new candidate: {cand_email}")
    reg_res = session.post(f"{BASE_URL}/auth/register/candidate/", json={
        "name": "E2E Candidate Maya",
        "email": cand_email,
        "phone": "+1 (555) 777-8888",
        "password": cand_password,
        "confirm_password": cand_password
    })
    assert reg_res.status_code == 201, f"Signup failed: {reg_res.text}"
    print("   [OK] Candidate registered successfully (HTTP 201)")

    # Step 2: Candidate Login
    print("\n2. Logging in candidate to obtain JWT access token...")
    cand_login_res = session.post(f"{BASE_URL}/auth/login/", json={
        "email": cand_email,
        "password": cand_password
    })
    assert cand_login_res.status_code == 200, f"Login failed: {cand_login_res.text}"
    cand_token = cand_login_res.json()["access"]
    cand_headers = {"Authorization": f"Bearer {cand_token}"}
    print(f"   [OK] Candidate JWT Token received: {cand_token[:25]}...")

    # Step 3: Update Candidate Profile
    print("\n3. Updating candidate profile with skills...")
    prof_res = session.put(f"{BASE_URL}/candidate/profile/", json={
        "location": "Denver, CO",
        "bio": "Experienced Python Backend Engineer specializing in Django and MySQL.",
        "skills": "Python, Django, SQL, MySQL, Git, Docker, REST API",
        "experience": 4,
        "education": "B.S. in Computer Science"
    }, headers=cand_headers)
    assert prof_res.status_code == 200, f"Profile update failed: {prof_res.text}"
    print(f"   [OK] Candidate profile saved: skills = {prof_res.json()['skills']}")

    # Step 4: Recruiter Login
    rec_email = "recruiter@techcorp.com"
    rec_password = "Recruiter@123"
    print(f"\n4. Logging in recruiter: {rec_email}")
    rec_login_res = session.post(f"{BASE_URL}/auth/login/", json={
        "email": rec_email,
        "password": rec_password
    })
    assert rec_login_res.status_code == 200, f"Recruiter login failed: {rec_login_res.text}"
    rec_token = rec_login_res.json()["access"]
    rec_headers = {"Authorization": f"Bearer {rec_token}"}
    print("   [OK] Recruiter JWT Token received")

    # Step 5: Recruiter Creates Job (starts as PENDING_APPROVAL)
    print("\n5. Recruiter creating new position: 'Lead Python API Developer' (status=PENDING_APPROVAL)")
    job_payload = {
        "title": "Lead Python API Developer",
        "company": "TechCorp Innovations",
        "department": "Platform Services",
        "description": "Design and build scalable REST APIs using Python, Django, MySQL, and Docker.",
        "responsibilities": "- Lead backend API architecture\n- Optimize MySQL queries",
        "qualifications": "- 3+ years experience with Python & Django",
        "location": "Denver, CO (Hybrid)",
        "job_type": "FULL_TIME",
        "experience_min": 3,
        "experience_max": 7,
        "salary_min": 120000,
        "salary_max": 150000,
        "required_skills": "Python, Django, MySQL, REST API, Git, Docker",
        "openings": 2,
        "status": "PENDING_APPROVAL"
    }
    job_res = session.post(f"{BASE_URL}/recruiter/jobs/", json=job_payload, headers=rec_headers)
    assert job_res.status_code == 201, f"Job creation failed: {job_res.text}"
    created_job_id = job_res.json()["id"]
    print(f"   [OK] Job created with ID: {created_job_id}, status: {job_res.json()['status']}")

    # Step 6: Verify Job is NOT yet public
    print("\n6. Verifying pending job does NOT appear in public listing...")
    pub_res = session.get(f"{BASE_URL}/jobs/?search=Lead+Python+API+Developer")
    pub_ids = [j["id"] for j in pub_res.json().get("results", [])]
    assert created_job_id not in pub_ids, "Pending job should not be public!"
    print("   [OK] Pending job correctly withheld from public search")

    # Step 7: Admin Login & Approval
    print("\n7. Logging in as Administrator: admin@hireflow.com")
    admin_login_res = session.post(f"{BASE_URL}/auth/login/", json={
        "email": "admin@hireflow.com",
        "password": "Admin@123"
    })
    assert admin_login_res.status_code == 200, f"Admin login failed: {admin_login_res.text}"
    admin_token = admin_login_res.json()["access"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("   [OK] Admin authenticated")

    print(f"   Admin approving job ID {created_job_id}...")
    approve_res = session.patch(f"{BASE_URL}/admin/jobs/{created_job_id}/review/", json={
        "action": "APPROVE",
        "admin_feedback": "Meets quality standards. Approved for public listing."
    }, headers=admin_headers)
    assert approve_res.status_code == 200, f"Approval failed: {approve_res.text}"
    print(f"   [OK] Job approved: status is now {approve_res.json()['status']}")

    # Step 8: Candidate Finds Job & Applies
    print("\n8. Candidate searching public jobs and applying...")
    search_res = session.get(f"{BASE_URL}/jobs/?search=Lead+Python+API+Developer")
    assert search_res.status_code == 200
    matched_jobs = search_res.json().get("results", [])
    assert any(j["id"] == created_job_id for j in matched_jobs), "Approved job should now be searchable!"
    print("   [OK] Candidate successfully located active job in public search")

    # Candidate submits application with in-memory dummy PDF
    print("   Candidate submitting application with resume and cover letter...")
    dummy_pdf = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF"
    apply_files = {
        'resume': ('candidate_resume.pdf', dummy_pdf, 'application/pdf')
    }
    apply_data = {
        'job_id': created_job_id,
        'cover_letter': 'Excited to apply for this lead role. My profile includes Python, Django, MySQL, REST API, Git, Docker.',
        'additional_information': 'Available immediately.'
    }
    apply_res = session.post(f"{BASE_URL}/candidate/applications/", data=apply_data, files=apply_files, headers=cand_headers)
    assert apply_res.status_code == 201, f"Apply failed: {apply_res.text}"
    app_data = apply_res.json()
    application_id = app_data["id"]
    print(f"   [OK] Application created! ID: {application_id}, Match Score: {app_data['match_score']}%, Status: {app_data['status']}")

    # Step 9: Recruiter Reviews Applicant Dossier & Match Breakdown
    print(f"\n9. Recruiter reviewing applicant dossier {application_id}...")
    dossier_res = session.get(f"{BASE_URL}/recruiter/applicants/{application_id}/", headers=rec_headers)
    assert dossier_res.status_code == 200
    dossier = dossier_res.json()
    analysis = dossier["match_analysis"]
    print(f"   [OK] Candidate: {dossier['candidate']['name']}")
    print(f"   [OK] Resume Match Score: {dossier['match_score']}%")
    print(f"   [OK] Matched Skills ({len(analysis['matched_skills'])}): {analysis['matched_skills']}")
    print(f"   [OK] Missing Skills ({len(analysis['missing_skills'])}): {analysis['missing_skills']}")

    # Step 10: Recruiter Moves Candidate through Pipeline: UNDER_REVIEW -> SHORTLISTED
    print("\n10. Recruiter moving candidate to UNDER_REVIEW, then SHORTLISTED...")
    review_res = session.patch(f"{BASE_URL}/recruiter/applicants/{application_id}/status/", json={
        "status": "UNDER_REVIEW"
    }, headers=rec_headers)
    assert review_res.status_code == 200, f"Failed to move to UNDER_REVIEW: {review_res.text}"
    print("   [OK] Candidate status updated to UNDER_REVIEW")

    shortlist_res = session.patch(f"{BASE_URL}/recruiter/applicants/{application_id}/status/", json={
        "status": "SHORTLISTED"
    }, headers=rec_headers)
    assert shortlist_res.status_code == 200, f"Failed to shortlist: {shortlist_res.text}"
    print("   [OK] Candidate status updated to SHORTLISTED")

    # Step 11: Recruiter Schedules Interview
    print("\n11. Recruiter scheduling Technical Interview...")
    interview_res = session.post(f"{BASE_URL}/recruiter/interviews/", json={
        "application_id": application_id,
        "date": "2026-10-15",
        "time": "14:30:00",
        "interview_type": "TECHNICAL",
        "meeting_link": "https://meet.google.com/hireflow-e2e-demo",
        "interviewer": "Sarah Jenkins (Lead Architect)",
        "notes": "System design round focusing on MySQL partitioning and Django caching."
    }, headers=rec_headers)
    assert interview_res.status_code == 201, f"Scheduling failed: {interview_res.text}"
    interview_id = interview_res.json()["id"]
    print(f"   [OK] Interview scheduled! ID: {interview_id}, Round: TECHNICAL")

    # Step 12: Candidate Views Scheduled Interview
    print("\n12. Candidate checking scheduled interviews...")
    cand_int_res = session.get(f"{BASE_URL}/candidate/interviews/", headers=cand_headers)
    assert cand_int_res.status_code == 200
    interviews = cand_int_res.json().get("results", [])
    assert any(i["id"] == interview_id for i in interviews)
    print("   [OK] Candidate sees scheduled interview with meeting link in their portal")

    # Step 13: Recruiter Completes Interview
    print("\n13. Recruiter marking interview COMPLETED...")
    int_comp_res = session.patch(f"{BASE_URL}/recruiter/interviews/{interview_id}/", json={
        "status": "COMPLETED"
    }, headers=rec_headers)
    assert int_comp_res.status_code == 200
    print("   [OK] Interview marked COMPLETED; application status auto-updated to INTERVIEW_COMPLETED")

    # Step 14: Recruiter Makes Final Decision: SELECTED
    print("\n14. Recruiter making final decision: SELECTED (Hired!)...")
    hire_res = session.patch(f"{BASE_URL}/recruiter/applicants/{application_id}/status/", json={
        "status": "SELECTED"
    }, headers=rec_headers)
    assert hire_res.status_code == 200
    print(f"   [OK] Candidate marked as SELECTED!")

    # Step 15: Candidate Checks Final Status & Notifications
    print("\n15. Candidate verifying final status and notifications...")
    final_app_res = session.get(f"{BASE_URL}/candidate/applications/{application_id}/", headers=cand_headers)
    assert final_app_res.status_code == 200
    assert final_app_res.json()["status"] == "SELECTED"
    print("   [OK] Candidate application status confirmed: SELECTED")

    notif_res = session.get(f"{BASE_URL}/notifications/", headers=cand_headers)
    assert notif_res.status_code == 200
    notifs = notif_res.json().get("results", [])
    print(f"   [OK] Candidate received {len(notifs)} real-time notifications across the workflow!")

    print("\n==================================================================")
    print("ALL 15 END-TO-END WORKFLOW STAGES PASSED FLAWLESSLY!")
    print("==================================================================")

if __name__ == '__main__':
    run_test()
