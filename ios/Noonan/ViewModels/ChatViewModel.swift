import Foundation

@MainActor
class ChatViewModel: ObservableObject {
    @Published var messages: [ChatMessage] = []
    @Published var isLoading = false
    @Published var conversationId: UUID?
    @Published var suggestedReplies: [String] = []

    private let chatService = ChatService()

    func loadInitialState() async {
        do {
            let conversations = try await chatService.loadConversations()
            if let latest = conversations.first {
                conversationId = latest.id
                messages = try await chatService.loadMessages(conversationId: latest.id)

                // Show suggested replies if only the intro message exists
                if messages.count == 1 && messages.first?.role == "assistant" {
                    suggestedReplies = [
                        "I just played a round",
                        "I'm playing soon",
                        "Tell me about yourself"
                    ]
                }
            }
        } catch {
            print("Load initial state error: \(error)")
        }
    }

    func sendMessage(_ text: String) async {
        suggestedReplies = []

        let userMessage = ChatMessage(
            id: UUID(),
            conversationId: conversationId ?? UUID(),
            role: "user",
            content: text,
            createdAt: Date()
        )
        messages.append(userMessage)
        isLoading = true

        do {
            let response = try await chatService.sendMessage(text, conversationId: conversationId)
            conversationId = response.conversationId

            let assistantMessage = ChatMessage(
                id: UUID(),
                conversationId: response.conversationId,
                role: "assistant",
                content: response.message,
                createdAt: Date()
            )
            messages.append(assistantMessage)

            // Update memory in background
            Task {
                try? await chatService.updateMemory(conversationId: response.conversationId)
            }
        } catch {
            print("Send message error: \(error)")
            messages.removeLast()
        }

        isLoading = false
    }

    func loadConversation(_ id: UUID) async {
        conversationId = id
        do {
            messages = try await chatService.loadMessages(conversationId: id)
        } catch {
            print("Load messages error: \(error)")
        }
    }

    func startNewConversation() {
        conversationId = nil
        messages = []
        suggestedReplies = []
    }
}
