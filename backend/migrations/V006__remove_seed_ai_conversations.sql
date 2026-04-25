-- Remove known demo AI conversation records so the admin only shows real captured data.
DELETE FROM ai_conversations
WHERE session_id = 'session_001'
   OR session_id = 'web-session-demo-001'
   OR (
        user_email = 'john@example.com'
    AND user_name = 'John Smith'
    AND user_company = 'ABC Trading Co.'
   )
   OR (
        user_email = 'alice@example.com'
    AND user_name = 'Alice Brown'
    AND user_company = 'Northwind Procurement'
   );
