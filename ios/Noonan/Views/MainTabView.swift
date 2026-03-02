import SwiftUI

struct MainTabView: View {
    @ObservedObject var authVM: AuthViewModel

    var body: some View {
        TabView {
            ChatView()
                .tabItem {
                    Label("Chat", systemImage: "message.fill")
                }

            RoundsView()
                .tabItem {
                    Label("My Rounds", systemImage: "flag.fill")
                }

            ProfileView(authVM: authVM)
                .tabItem {
                    Label("Profile", systemImage: "person.fill")
                }
        }
        .tint(.green)
    }
}
