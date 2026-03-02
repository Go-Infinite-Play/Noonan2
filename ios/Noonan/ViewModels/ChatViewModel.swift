import Foundation

@MainActor
class ChatViewModel: ObservableObject {
    @Published var messages: [ChatMessage] = []
    @Published var isLoading = false
    @Published var conversationId: UUID?

    private let chatService = ChatService()

    func sendMessage(_ text: String) async {
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
            // Remove the optimistic user message on error
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
    }
}
