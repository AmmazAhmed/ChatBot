# Inquisitor Chatbot - Testing Report

## Test Cases (30+)

| ID | Test Type | Query | Expected | Actual | Result |
|----|-----------|-------|----------|--------|--------|
| TC-001 | Normal | "How do I enroll in a course?" | Enrollment steps | Correct steps provided | PASS |
| TC-002 | Normal | "How do I register for an event?" | Event registration steps | Correct steps provided | PASS |
| TC-003 | Normal | "How do I get a certificate?" | Certificate process | Correct process provided | PASS |
| TC-004 | Normal | "How do I apply for an internship?" | Application steps | Correct steps provided | PASS |
| TC-005 | Normal | "How do I create an account?" | Registration steps | Correct steps provided | PASS |
| TC-006 | Normal | "How do I reset my password?" | Password reset steps | Correct steps provided | PASS |
| TC-007 | Normal | "What courses are available?" | Course information | Course details provided | PASS |
| TC-008 | Normal | "What events are coming up?" | Event information | Event details provided | PASS |
| TC-009 | Normal | "What internships are available?" | Internship information | Internship details provided | PASS |
| TC-010 | Normal | "How do I become a member?" | Membership process | Correct process provided | PASS |
| TC-011 | Complex | "How do I enroll in courses and apply for internships?" | Both processes | Both processes explained | PASS |
| TC-012 | Complex | "How do I get certificates and verify them?" | Both processes | Both processes explained | PASS |
| TC-013 | Incomplete | "Enroll course..." | Clarification/assistance | Provided enrollment info | PASS |
| TC-014 | Incomplete | "Certificate..." | Certificate information | Provided certificate info | PASS |
| TC-015 | Misspelled | "How do i enroll in a cors?" | Enrollment steps | Correct enrollment info provided | PASS |
| TC-016 | Misspelled | "How do i registor for event?" | Registration steps | Correct registration info | PASS |
| TC-017 | Unrelated | "What's the weather?" | Out of scope response | Polite out-of-scope response | PASS |
| TC-018 | Unrelated | "Tell me a joke" | Out of scope response | Polite out-of-scope response | PASS |
| TC-019 | Repeated | "How do I enroll?" (3x) | Consistent response | Consistent each time | PASS |
| TC-020 | Out of Scope | "Create a course for me" | Cannot create courses | Explained limitation | PASS |
| TC-021 | Invalid | "asdfjkl" | Fallback response | Asked to rephrase | PASS |
| TC-022 | Long | Paragraph about multiple questions | Processed all questions | Addressed key points | PASS |
| TC-023 | Multi-Question | "How to enroll? What's the deadline? Who teaches?" | All questions | All questions answered | PASS |
| TC-024 | Greeting | "Hello" | Welcome message | Friendly greeting | PASS |
| TC-025 | Greeting | "Hi" | Welcome message | Friendly greeting | PASS |
| TC-026 | Payment | "How do I pay for courses?" | Payment methods | All methods listed | PASS |
| TC-027 | Payment | "What payment methods?" | Payment options | All options listed | PASS |
| TC-028 | Profile | "How do I update my profile?" | Profile update steps | Correct steps provided | PASS |
| TC-029 | Community | "How do I use forums?" | Forum usage | Correct usage provided | PASS |
| TC-030 | Community | "What are community guidelines?" | Guidelines | Guidelines provided | PASS |
| TC-031 | Technical | "What browsers are supported?" | Browser list | All browsers listed | PASS |
| TC-032 | Technical | "What are system requirements?" | Requirements | Requirements provided | PASS |
| TC-033 | Support | "How do I contact support?" | Contact methods | All methods provided | PASS |
| TC-034 | Support | "I need help" | Support options | Support options provided | PASS |
| TC-035 | Career | "How do I build my portfolio?" | Portfolio steps | Correct steps provided | PASS |
| TC-036 | Career | "How do I use resume builder?" | Resume builder steps | Correct steps provided | PASS |

## Summary
- **Total Tests**: 36
- **Passed**: 36
- **Failed**: 0
- **Pass Rate**: 100%

## Required Improvements
1. Add more specific error messages
2. Improve handling of very long questions
3. Add more follow-up suggestions
4. Enhance multilingual support (Urdu)

## Conclusion
The chatbot meets all functional requirements and passes all test cases. The system is ready for deployment.