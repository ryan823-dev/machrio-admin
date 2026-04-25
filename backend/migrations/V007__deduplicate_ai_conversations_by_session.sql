-- Merge duplicate AI conversations by session_id so one frontend session maps to one backend conversation.

WITH ranked AS (
    SELECT
        id,
        session_id,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at ASC, id ASC) AS rn,
        FIRST_VALUE(id) OVER (PARTITION BY session_id ORDER BY created_at ASC, id ASC) AS keeper_id
    FROM ai_conversations
),
duplicates AS (
    SELECT id, keeper_id
    FROM ranked
    WHERE rn > 1
)
UPDATE conversation_messages AS m
SET conversation_id = d.keeper_id
FROM duplicates d
WHERE m.conversation_id = d.id;

WITH ranked AS (
    SELECT
        id,
        session_id,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at ASC, id ASC) AS rn,
        FIRST_VALUE(id) OVER (PARTITION BY session_id ORDER BY created_at ASC, id ASC) AS keeper_id
    FROM ai_conversations
),
duplicates AS (
    SELECT id, keeper_id
    FROM ranked
    WHERE rn > 1
)
UPDATE customer_requirements AS r
SET conversation_id = d.keeper_id
FROM duplicates d
WHERE r.conversation_id = d.id;

WITH ranked AS (
    SELECT
        id,
        session_id,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at ASC, id ASC) AS rn
    FROM ai_conversations
)
DELETE FROM ai_conversations c
USING ranked r
WHERE c.id = r.id
  AND r.rn > 1;

UPDATE ai_conversations c
SET
    message_count = COALESCE(msg.cnt, 0),
    first_message_at = msg.first_message_at,
    last_message_at = msg.last_message_at
FROM (
    SELECT
        conversation_id,
        COUNT(*) AS cnt,
        MIN(created_at) AS first_message_at,
        MAX(created_at) AS last_message_at
    FROM conversation_messages
    GROUP BY conversation_id
) AS msg
WHERE c.id = msg.conversation_id;

CREATE UNIQUE INDEX IF NOT EXISTS ux_ai_conversations_session_id
ON ai_conversations (session_id);
