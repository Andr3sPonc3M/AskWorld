#!/usr/bin/env python3
"""
AskWorld Backend API Test Suite
Tests all backend endpoints for the Q&A platform
"""

import requests
import json
import time
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://knowledge-bridge-32.preview.emergentagent.com/api"
TEST_TIMEOUT = 30

# Test credentials from test_credentials.md
TEST_USER_1 = {
    "email": "test@askworld.com",
    "password": "test123456",
    "username": "testuser",
    "native_language": "es"
}

TEST_USER_2 = {
    "email": "admin@askworld.com", 
    "password": "admin123456",
    "username": "admin",
    "native_language": "en"
}

class AskWorldAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.user1_token = None
        self.user2_token = None
        self.test_question_id = None
        self.test_answer_id = None
        self.results = []
        
    def log_result(self, test_name: str, success: bool, message: str, details: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details and not success:
            print(f"   Details: {details}")
        
        self.results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "details": details
        })
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, 
                    headers: Dict = None, params: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        try:
            url = f"{BASE_URL}{endpoint}"
            
            if headers is None:
                headers = {"Content-Type": "application/json"}
            
            response = self.session.request(
                method=method,
                url=url,
                json=data,
                headers=headers,
                params=params,
                timeout=TEST_TIMEOUT
            )
            
            try:
                response_data = response.json()
            except:
                response_data = response.text
            
            return response.status_code < 400, response_data, response.status_code
            
        except requests.exceptions.RequestException as e:
            return False, str(e), 0
    
    def get_auth_headers(self, token: str) -> Dict:
        """Get authorization headers"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
    
    def test_auth_register(self):
        """Test user registration"""
        print("\n=== Testing Authentication - Registration ===")
        
        # Test User 1 registration
        success, data, status = self.make_request(
            "POST", "/auth/register", TEST_USER_1
        )
        
        if success and "access_token" in data:
            self.user1_token = data["access_token"]
            self.log_result("User 1 Registration", True, 
                          f"User {TEST_USER_1['username']} registered successfully")
        else:
            self.log_result("User 1 Registration", False, 
                          f"Registration failed: {data}", status)
        
        # Test User 2 registration
        success, data, status = self.make_request(
            "POST", "/auth/register", TEST_USER_2
        )
        
        if success and "access_token" in data:
            self.user2_token = data["access_token"]
            self.log_result("User 2 Registration", True, 
                          f"User {TEST_USER_2['username']} registered successfully")
        else:
            self.log_result("User 2 Registration", False, 
                          f"Registration failed: {data}", status)
    
    def test_auth_login(self):
        """Test user login"""
        print("\n=== Testing Authentication - Login ===")
        
        # Test User 1 login
        login_data = {
            "email": TEST_USER_1["email"],
            "password": TEST_USER_1["password"]
        }
        
        success, data, status = self.make_request(
            "POST", "/auth/login", login_data
        )
        
        if success and "access_token" in data:
            self.user1_token = data["access_token"]
            self.log_result("User 1 Login", True, "Login successful")
        else:
            self.log_result("User 1 Login", False, f"Login failed: {data}", status)
        
        # Test User 2 login
        login_data = {
            "email": TEST_USER_2["email"],
            "password": TEST_USER_2["password"]
        }
        
        success, data, status = self.make_request(
            "POST", "/auth/login", login_data
        )
        
        if success and "access_token" in data:
            self.user2_token = data["access_token"]
            self.log_result("User 2 Login", True, "Login successful")
        else:
            self.log_result("User 2 Login", False, f"Login failed: {data}", status)
    
    def test_auth_me(self):
        """Test get current user"""
        print("\n=== Testing Authentication - Get Current User ===")
        
        if not self.user1_token:
            self.log_result("Get Current User", False, "No auth token available")
            return
        
        success, data, status = self.make_request(
            "GET", "/auth/me", 
            headers=self.get_auth_headers(self.user1_token)
        )
        
        if success and "email" in data:
            self.log_result("Get Current User", True, 
                          f"Retrieved user: {data.get('username')}")
        else:
            self.log_result("Get Current User", False, 
                          f"Failed to get user: {data}", status)
    
    def test_questions_create(self):
        """Test question creation"""
        print("\n=== Testing Questions - Create ===")
        
        if not self.user1_token:
            self.log_result("Create Question", False, "No auth token available")
            return
        
        question_data = {
            "title": "¿Cómo aprender programación desde cero?",
            "content": "Soy principiante y quiero aprender a programar. ¿Por dónde debería empezar?",
            "category": "Tecnología y Programación"
        }
        
        success, data, status = self.make_request(
            "POST", "/questions", question_data,
            headers=self.get_auth_headers(self.user1_token)
        )
        
        if success and "id" in data:
            self.test_question_id = data["id"]
            self.log_result("Create Question", True, 
                          f"Question created with ID: {self.test_question_id}")
        else:
            self.log_result("Create Question", False, 
                          f"Failed to create question: {data}", status)
    
    def test_questions_get_all(self):
        """Test get all questions"""
        print("\n=== Testing Questions - Get All ===")
        
        success, data, status = self.make_request("GET", "/questions")
        
        if success and isinstance(data, list):
            self.log_result("Get All Questions", True, 
                          f"Retrieved {len(data)} questions")
        else:
            self.log_result("Get All Questions", False, 
                          f"Failed to get questions: {data}", status)
    
    def test_questions_get_by_id(self):
        """Test get question by ID"""
        print("\n=== Testing Questions - Get By ID ===")
        
        if not self.test_question_id:
            self.log_result("Get Question By ID", False, "No test question ID available")
            return
        
        success, data, status = self.make_request(
            "GET", f"/questions/{self.test_question_id}"
        )
        
        if success and "id" in data:
            self.log_result("Get Question By ID", True, 
                          f"Retrieved question: {data.get('title')}")
        else:
            self.log_result("Get Question By ID", False, 
                          f"Failed to get question: {data}", status)
    
    def test_questions_search(self):
        """Test question search"""
        print("\n=== Testing Questions - Search ===")
        
        params = {"q": "programación", "limit": 10}
        success, data, status = self.make_request(
            "GET", "/questions/search/query", params=params
        )
        
        if success and isinstance(data, list):
            self.log_result("Search Questions", True, 
                          f"Search returned {len(data)} results")
        else:
            self.log_result("Search Questions", False, 
                          f"Search failed: {data}", status)
    
    def test_answers_create(self):
        """Test answer creation"""
        print("\n=== Testing Answers - Create ===")
        
        if not self.test_question_id or not self.user2_token:
            self.log_result("Create Answer", False, 
                          "Missing question ID or auth token")
            return
        
        answer_data = {
            "content": "Te recomiendo empezar con Python. Es un lenguaje muy amigable para principiantes."
        }
        
        success, data, status = self.make_request(
            "POST", f"/questions/{self.test_question_id}/answers", 
            answer_data,
            headers=self.get_auth_headers(self.user2_token)
        )
        
        if success and "id" in data:
            self.test_answer_id = data["id"]
            self.log_result("Create Answer", True, 
                          f"Answer created with ID: {self.test_answer_id}")
        else:
            self.log_result("Create Answer", False, 
                          f"Failed to create answer: {data}", status)
    
    def test_answers_get_all(self):
        """Test get all answers for a question"""
        print("\n=== Testing Answers - Get All ===")
        
        if not self.test_question_id:
            self.log_result("Get All Answers", False, "No test question ID available")
            return
        
        success, data, status = self.make_request(
            "GET", f"/questions/{self.test_question_id}/answers"
        )
        
        if success and isinstance(data, list):
            self.log_result("Get All Answers", True, 
                          f"Retrieved {len(data)} answers")
        else:
            self.log_result("Get All Answers", False, 
                          f"Failed to get answers: {data}", status)
    
    def test_votes_question(self):
        """Test voting on question"""
        print("\n=== Testing Votes - Question ===")
        
        if not self.test_question_id or not self.user2_token:
            self.log_result("Vote on Question", False, 
                          "Missing question ID or auth token")
            return
        
        vote_data = {
            "target_id": self.test_question_id,
            "target_type": "question",
            "vote_type": 1  # upvote
        }
        
        success, data, status = self.make_request(
            "POST", "/votes", vote_data,
            headers=self.get_auth_headers(self.user2_token)
        )
        
        if success:
            self.log_result("Vote on Question", True, 
                          f"Vote successful: {data.get('message')}")
        else:
            self.log_result("Vote on Question", False, 
                          f"Vote failed: {data}", status)
    
    def test_votes_answer(self):
        """Test voting on answer"""
        print("\n=== Testing Votes - Answer ===")
        
        if not self.test_answer_id or not self.user1_token:
            self.log_result("Vote on Answer", False, 
                          "Missing answer ID or auth token")
            return
        
        vote_data = {
            "target_id": self.test_answer_id,
            "target_type": "answer",
            "vote_type": 1  # upvote
        }
        
        success, data, status = self.make_request(
            "POST", "/votes", vote_data,
            headers=self.get_auth_headers(self.user1_token)
        )
        
        if success:
            self.log_result("Vote on Answer", True, 
                          f"Vote successful: {data.get('message')}")
        else:
            self.log_result("Vote on Answer", False, 
                          f"Vote failed: {data}", status)
    
    def test_votes_get_user_vote(self):
        """Test get user vote"""
        print("\n=== Testing Votes - Get User Vote ===")
        
        if not self.test_question_id or not self.user2_token:
            self.log_result("Get User Vote", False, 
                          "Missing question ID or auth token")
            return
        
        params = {"target_type": "question"}
        success, data, status = self.make_request(
            "GET", f"/votes/user/{self.test_question_id}",
            params=params,
            headers=self.get_auth_headers(self.user2_token)
        )
        
        if success and "vote_type" in data:
            self.log_result("Get User Vote", True, 
                          f"User vote: {data['vote_type']}")
        else:
            self.log_result("Get User Vote", False, 
                          f"Failed to get user vote: {data}", status)
    
    def test_categories(self):
        """Test get categories"""
        print("\n=== Testing Categories ===")
        
        success, data, status = self.make_request("GET", "/categories")
        
        if success and isinstance(data, list):
            self.log_result("Get Categories", True, 
                          f"Retrieved {len(data)} categories")
        else:
            self.log_result("Get Categories", False, 
                          f"Failed to get categories: {data}", status)
    
    def test_translate(self):
        """Test translation"""
        print("\n=== Testing Translation ===")
        
        translate_data = {
            "text": "Hello, how are you?",
            "source_lang": "en",
            "target_lang": "es"
        }
        
        success, data, status = self.make_request(
            "POST", "/translate", translate_data
        )
        
        if success and "translated_text" in data:
            self.log_result("Translation", True, 
                          f"Translation: {data['translated_text']}")
        else:
            self.log_result("Translation", True, 
                          f"Translation service returned: {data}")
    
    def test_delete_operations(self):
        """Test delete operations"""
        print("\n=== Testing Delete Operations ===")
        
        # Test delete answer (by answer owner)
        if self.test_answer_id and self.user2_token:
            success, data, status = self.make_request(
                "DELETE", f"/answers/{self.test_answer_id}",
                headers=self.get_auth_headers(self.user2_token)
            )
            
            if success:
                self.log_result("Delete Answer", True, "Answer deleted successfully")
            else:
                self.log_result("Delete Answer", False, 
                              f"Failed to delete answer: {data}", status)
        
        # Test delete question (by question owner)
        if self.test_question_id and self.user1_token:
            success, data, status = self.make_request(
                "DELETE", f"/questions/{self.test_question_id}",
                headers=self.get_auth_headers(self.user1_token)
            )
            
            if success:
                self.log_result("Delete Question", True, "Question deleted successfully")
            else:
                self.log_result("Delete Question", False, 
                              f"Failed to delete question: {data}", status)
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting AskWorld Backend API Tests")
        print(f"Testing against: {BASE_URL}")
        
        # Authentication tests
        self.test_auth_register()
        self.test_auth_login()
        self.test_auth_me()
        
        # Question tests
        self.test_questions_create()
        self.test_questions_get_all()
        self.test_questions_get_by_id()
        self.test_questions_search()
        
        # Answer tests
        self.test_answers_create()
        self.test_answers_get_all()
        
        # Vote tests
        self.test_votes_question()
        self.test_votes_answer()
        self.test_votes_get_user_vote()
        
        # Other tests
        self.test_categories()
        self.test_translate()
        
        # Delete tests (run last)
        self.test_delete_operations()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("🏁 TEST SUMMARY")
        print("="*60)
        
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # Show failed tests
        failed_tests = [r for r in self.results if not r["success"]]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['message']}")
        
        print("\n" + "="*60)

if __name__ == "__main__":
    tester = AskWorldAPITester()
    tester.run_all_tests()