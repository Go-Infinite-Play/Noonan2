import SwiftUI
import AuthenticationServices

struct AuthView: View {
    @ObservedObject var authVM: AuthViewModel

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            VStack(spacing: 12) {
                Text("Noonan")
                    .font(.system(size: 48, weight: .bold))
                    .foregroundColor(.green)

                Text("The only person who actually\ncares about your golf game.")
                    .font(.title3)
                    .multilineTextAlignment(.center)
                    .foregroundColor(.secondary)
            }

            Spacer()

            SignInWithAppleButton(.signIn) { request in
                request.requestedScopes = [.fullName, .email]
            } onCompletion: { result in
                switch result {
                case .success(let authorization):
                    Task {
                        await authVM.signInWithApple(authorization: authorization)
                    }
                case .failure(let error):
                    print("Apple Sign-In failed: \(error)")
                }
            }
            .signInWithAppleButtonStyle(.black)
            .frame(height: 50)
            .padding(.horizontal, 40)

            Spacer()
                .frame(height: 60)
        }
    }
}
