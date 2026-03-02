import SwiftUI

@main
struct NoonanApp: App {
    @StateObject private var authVM = AuthViewModel()

    var body: some Scene {
        WindowGroup {
            Group {
                if authVM.isLoading {
                    ProgressView()
                } else if !authVM.isAuthenticated {
                    AuthView(authVM: authVM)
                } else if authVM.needsOnboarding {
                    OnboardingView(authVM: authVM)
                } else {
                    MainTabView(authVM: authVM)
                }
            }
            .onOpenURL { url in
                Task { await authVM.handleDeepLink(url) }
            }
        }
    }
}
