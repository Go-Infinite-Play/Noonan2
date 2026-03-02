import Foundation
import Supabase
import AuthenticationServices

@MainActor
class AuthViewModel: ObservableObject {
    @Published var isAuthenticated = false
    @Published var isLoading = true
    @Published var errorMessage: String?

    init() {
        Task {
            await checkSession()
        }
    }

    func checkSession() async {
        do {
            _ = try await supabase.auth.session
            isAuthenticated = true
        } catch {
            isAuthenticated = false
        }
        isLoading = false
    }

    func signInWithApple(authorization: ASAuthorization) async {
        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let identityToken = credential.identityToken,
              let tokenString = String(data: identityToken, encoding: .utf8) else {
            return
        }

        do {
            _ = try await supabase.auth.signInWithIdToken(
                credentials: .init(
                    provider: .apple,
                    idToken: tokenString
                )
            )
            isAuthenticated = true
        } catch {
            print("Apple sign in error: \(error)")
        }
    }

    func signInWithGoogle() async {
        do {
            try await supabase.auth.signInWithOAuth(
                provider: .google,
                redirectTo: URL(string: "com.noonan.Noonan://login-callback")
            )
            // Auth state will be picked up by the onOpenURL handler
        } catch {
            print("Google sign in error: \(error)")
        }
    }

    func handleDeepLink(_ url: URL) async {
        do {
            _ = try await supabase.auth.session(from: url)
            isAuthenticated = true
        } catch {
            print("Deep link auth error: \(error)")
        }
    }

    func signUpWithEmail(email: String, password: String) async {
        errorMessage = nil
        do {
            _ = try await supabase.auth.signUp(
                email: email,
                password: password
            )
            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
            print("Email sign up error: \(error)")
        }
    }

    func signInWithEmail(email: String, password: String) async {
        errorMessage = nil
        do {
            _ = try await supabase.auth.signIn(
                email: email,
                password: password
            )
            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
            print("Email sign in error: \(error)")
        }
    }

    func signOut() async {
        do {
            try await supabase.auth.signOut()
            isAuthenticated = false
        } catch {
            print("Sign out error: \(error)")
        }
    }
}
