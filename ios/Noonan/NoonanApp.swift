import SwiftUI

@main
struct NoonanApp: App {
    @StateObject private var authVM = AuthViewModel()

    var body: some Scene {
        WindowGroup {
            Group {
                if authVM.isLoading {
                    ProgressView()
                } else if authVM.isAuthenticated {
                    MainTabView(authVM: authVM)
                } else {
                    AuthView(authVM: authVM)
                }
            }
            .onOpenURL { url in
                Task { await authVM.handleDeepLink(url) }
            }
        }
    }
}
