import SwiftUI

struct MessageBubble: View {
    let message: ChatMessage

    var body: some View {
        HStack {
            if message.isUser { Spacer() }

            Text(message.content)
                .padding(12)
                .background(message.isUser ? Color.green : Color(.systemGray5))
                .foregroundColor(message.isUser ? .white : .primary)
                .clipShape(RoundedRectangle(cornerRadius: 16))

            if !message.isUser { Spacer() }
        }
        .padding(.horizontal)
    }
}
