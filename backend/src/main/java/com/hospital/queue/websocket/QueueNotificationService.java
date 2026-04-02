package com.hospital.queue.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class QueueNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcast live queue update to all subscribers of a department channel.
     * Frontend subscribes to /topic/queue/{department}
     */
    public void broadcastQueueUpdate(String department) {
        Map<String, Object> payload = Map.of(
            "department", department,
            "timestamp", LocalDateTime.now().toString(),
            "event", "QUEUE_UPDATED"
        );
        messagingTemplate.convertAndSend("/topic/queue/" + department, payload);
        log.info("WebSocket broadcast → /topic/queue/{}", department);
    }

    /**
     * Send a smart AI-driven alert directly to a patient (user-specific channel).
     * Frontend subscribes to /user/queue/alerts
     */
    public void sendSmartAlert(String userEmail, String message) {
        Map<String, Object> payload = Map.of(
            "message", message,
            "timestamp", LocalDateTime.now().toString(),
            "type", "AI_ALERT"
        );
        messagingTemplate.convertAndSendToUser(userEmail, "/queue/alerts", payload);
        log.info("Smart AI alert sent to {}: {}", userEmail, message);
    }
}
