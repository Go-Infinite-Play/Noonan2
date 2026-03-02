import SwiftUI
import AuthenticationServices

struct AuthView: View {
    @ObservedObject var authVM: AuthViewModel
    @State private var email = ""
    @State private var password = ""
    @State private var isSignUp = false
    @State private var showEmailForm = false

    var body: some View {
        ScrollView {
            VStack(spacing: 28) {
                Spacer().frame(height: 60)

                VStack(spacing: 12) {
                    Text("Noonan")
                        .font(.system(size: 48, weight: .bold))
                        .foregroundColor(.green)

                    Text("The only person who actually\ncares about your golf game.")
                        .font(.title3)
                        .multilineTextAlignment(.center)
                        .foregroundColor(.secondary)
                }

                Spacer().frame(height: 20)

                if showEmailForm {
                    // Email/Password Form
                    VStack(spacing: 16) {
                        TextField("Email", text: $email)
                            .textFieldStyle(.roundedBorder)
                            .textContentType(.emailAddress)
                            .autocapitalization(.none)
                            .keyboardType(.emailAddress)

                        SecureField("Password", text: $password)
                            .textFieldStyle(.roundedBorder)
                            .textContentType(isSignUp ? .newPassword : .password)

                        if let error = authVM.errorMessage {
                            Text(error)
                                .font(.caption)
                                .foregroundColor(.red)
                                .multilineTextAlignment(.center)
                        }

                        Button {
                            Task {
                                if isSignUp {
                                    await authVM.signUpWithEmail(email: email, password: password)
                                } else {
                                    await authVM.signInWithEmail(email: email, password: password)
                                }
                            }
                        } label: {
                            Text(isSignUp ? "Create Account" : "Sign In")
                                .font(.body.weight(.semibold))
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                                .background(Color.green)
                                .foregroundColor(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                        }
                        .disabled(email.isEmpty || password.count < 6)

                        Button {
                            isSignUp.toggle()
                            authVM.errorMessage = nil
                        } label: {
                            Text(isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up")
                                .font(.caption)
                                .foregroundColor(.green)
                        }

                        Button {
                            showEmailForm = false
                        } label: {
                            Text("Back to other options")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.horizontal, 40)
                } else {
                    // Sign-in buttons
                    VStack(spacing: 12) {
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

                        Button {
                            Task { await authVM.signInWithGoogle() }
                        } label: {
                            HStack(spacing: 8) {
                                Image(systemName: "globe")
                                    .font(.body)
                                Text("Sign in with Google")
                                    .font(.body.weight(.medium))
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color(.systemBackground))
                            .foregroundColor(.primary)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color(.systemGray3), lineWidth: 1)
                            )
                        }

                        Button {
                            showEmailForm = true
                            isSignUp = true
                        } label: {
                            HStack(spacing: 8) {
                                Image(systemName: "envelope")
                                    .font(.body)
                                Text("Sign up with Email")
                                    .font(.body.weight(.medium))
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color(.systemBackground))
                            .foregroundColor(.primary)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color(.systemGray3), lineWidth: 1)
                            )
                        }
                    }
                    .padding(.horizontal, 40)

                    #if DEBUG
                    Button {
                        authVM.isAuthenticated = true
                    } label: {
                        Text("Skip Login (Debug)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 8)
                    #endif
                }

                Spacer().frame(height: 40)
            }
        }
    }
}
