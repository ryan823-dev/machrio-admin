package com.machrio.admin.repository;

import com.machrio.admin.entity.ConversationMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ConversationMessageRepository extends JpaRepository<ConversationMessage, UUID> {
    List<ConversationMessage> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);

    long countByConversationId(UUID conversationId);

    void deleteByConversationId(UUID conversationId);

    @Modifying
    @Query("UPDATE ConversationMessage m SET m.conversationId = :targetConversationId WHERE m.conversationId = :sourceConversationId")
    void moveConversationMessages(UUID sourceConversationId, UUID targetConversationId);
}
