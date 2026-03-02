import SwiftUI

struct OnboardingView: View {
    @ObservedObject var authVM: AuthViewModel
    @StateObject private var vm = OnboardingViewModel()

    var body: some View {
        VStack(spacing: 0) {
            // Progress dots
            HStack(spacing: 8) {
                ForEach(0..<vm.totalSteps, id: \.self) { step in
                    Circle()
                        .fill(step <= vm.currentStep ? Color.green : Color(.systemGray4))
                        .frame(width: 8, height: 8)
                        .animation(.easeInOut(duration: 0.3), value: vm.currentStep)
                }
            }
            .padding(.top, 16)

            // Back button
            HStack {
                if vm.currentStep > 0 {
                    Button {
                        vm.goBack()
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "chevron.left")
                                .font(.body.weight(.medium))
                            Text("Back")
                        }
                        .foregroundColor(.secondary)
                    }
                }
                Spacer()
            }
            .padding(.horizontal, 24)
            .padding(.top, 12)
            .frame(height: 44)

            // Content
            TabView(selection: $vm.currentStep) {
                NameStep(vm: vm).tag(0)
                GameStep(vm: vm).tag(1)
                WeaknessStep(vm: vm).tag(2)
                IntroStep(vm: vm, authVM: authVM).tag(3)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .allowsHitTesting(true)
        }
        .background(Color(.systemBackground))
    }
}

// MARK: - Step 1: Name

private struct NameStep: View {
    @ObservedObject var vm: OnboardingViewModel
    @FocusState private var nameFieldFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            VStack(spacing: 16) {
                Text("Hey there.")
                    .font(.system(size: 40, weight: .bold))
                    .foregroundColor(.primary)

                Text("I'm Noonan. Before we start —\nwhat should I call you?")
                    .font(.title3)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
            }

            TextField("First name", text: $vm.firstName)
                .font(.title2)
                .multilineTextAlignment(.center)
                .padding(.vertical, 16)
                .padding(.horizontal, 40)
                .focused($nameFieldFocused)
                .submitLabel(.continue)
                .onSubmit {
                    if vm.canAdvance() { vm.advance() }
                }
                .padding(.top, 40)

            Rectangle()
                .fill(Color.green.opacity(0.4))
                .frame(width: 200, height: 2)

            Spacer()

            ContinueButton(enabled: vm.canAdvance()) {
                nameFieldFocused = false
                vm.advance()
            }
            .padding(.bottom, 60)
        }
        .padding(.horizontal, 24)
        .onAppear { nameFieldFocused = true }
    }
}

// MARK: - Step 2: Game Level

private struct GameStep: View {
    @ObservedObject var vm: OnboardingViewModel

    var body: some View {
        VStack(spacing: 0) {
            Spacer()
                .frame(height: 40)

            VStack(spacing: 8) {
                Text("Nice to meet you, \(vm.firstName).")
                    .font(.system(size: 32, weight: .bold))
                    .multilineTextAlignment(.center)

                Text("How's your game?")
                    .font(.title3)
                    .foregroundColor(.secondary)
            }

            // Handicap range pills
            VStack(spacing: 10) {
                ForEach(HandicapRange.allCases) { range in
                    Button {
                        withAnimation(.easeInOut(duration: 0.15)) {
                            vm.handicapRange = range
                        }
                    } label: {
                        Text(range.rawValue)
                            .font(.body.weight(vm.handicapRange == range ? .semibold : .regular))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(
                                vm.handicapRange == range
                                    ? Color.green.opacity(0.15)
                                    : Color(.systemGray6)
                            )
                            .foregroundColor(
                                vm.handicapRange == range ? .green : .primary
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(
                                        vm.handicapRange == range ? Color.green : Color.clear,
                                        lineWidth: 2
                                    )
                            )
                    }
                }
            }
            .padding(.top, 28)

            // Play frequency
            Text("How often do you play?")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .padding(.top, 28)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(PlayFrequency.allCases) { freq in
                        Button {
                            vm.playFrequency = freq
                        } label: {
                            Text(freq.rawValue)
                                .font(.caption.weight(vm.playFrequency == freq ? .semibold : .regular))
                                .padding(.horizontal, 14)
                                .padding(.vertical, 10)
                                .background(
                                    vm.playFrequency == freq
                                        ? Color.green.opacity(0.15)
                                        : Color(.systemGray6)
                                )
                                .foregroundColor(
                                    vm.playFrequency == freq ? .green : .primary
                                )
                                .clipShape(Capsule())
                                .overlay(
                                    Capsule().stroke(
                                        vm.playFrequency == freq ? Color.green : Color.clear,
                                        lineWidth: 1.5
                                    )
                                )
                        }
                    }
                }
            }
            .padding(.top, 8)

            Spacer()

            ContinueButton(enabled: true) {
                vm.advance()
            }
            .padding(.bottom, 60)
        }
        .padding(.horizontal, 24)
    }
}

// MARK: - Step 3: Weakness

private struct WeaknessStep: View {
    @ObservedObject var vm: OnboardingViewModel

    let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
    ]

    var body: some View {
        VStack(spacing: 0) {
            Spacer()
                .frame(height: 40)

            VStack(spacing: 8) {
                Text("One more thing.")
                    .font(.system(size: 32, weight: .bold))

                Text("What's the one part of your game\nthat drives you crazy?")
                    .font(.title3)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
            }

            LazyVGrid(columns: columns, spacing: 12) {
                ForEach(GameWeakness.allCases) { w in
                    Button {
                        withAnimation(.easeInOut(duration: 0.15)) {
                            vm.weakness = w
                        }
                    } label: {
                        VStack(spacing: 8) {
                            Image(systemName: w.icon)
                                .font(.title2)
                            Text(w.rawValue)
                                .font(.subheadline.weight(.medium))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 20)
                        .background(
                            vm.weakness == w
                                ? Color.green.opacity(0.15)
                                : Color(.systemGray6)
                        )
                        .foregroundColor(
                            vm.weakness == w ? .green : .primary
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(
                                    vm.weakness == w ? Color.green : Color.clear,
                                    lineWidth: 2
                                )
                        )
                    }
                }
            }
            .padding(.top, 28)

            Spacer()

            ContinueButton(enabled: true) {
                vm.advance()
            }
            .padding(.bottom, 60)
        }
        .padding(.horizontal, 24)
    }
}

// MARK: - Step 4: Noonan Intro

private struct IntroStep: View {
    @ObservedObject var vm: OnboardingViewModel
    @ObservedObject var authVM: AuthViewModel
    @State private var showMessage = false

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            // Noonan's message in a chat bubble
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 10) {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 36, height: 36)
                        .overlay(
                            Text("N")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(.white)
                        )
                    Text("Noonan")
                        .font(.headline)
                        .foregroundColor(.primary)
                }

                Text(vm.noonanIntroMessage)
                    .font(.body)
                    .lineSpacing(4)
                    .padding(16)
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .opacity(showMessage ? 1 : 0)
                    .offset(y: showMessage ? 0 : 10)
                    .animation(.easeOut(duration: 0.5).delay(0.3), value: showMessage)
            }
            .padding(.horizontal, 8)

            Spacer()

            if let error = vm.error {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
                    .padding(.bottom, 8)
            }

            Button {
                Task {
                    // Try server-side onboarding, but don't block on failure
                    // (e.g. debug mode has no real auth session)
                    do {
                        try await vm.completeOnboarding()
                        let chatService = ChatService()
                        _ = try? await chatService.createFirstConversation(
                            introMessage: vm.noonanIntroMessage
                        )
                    } catch {
                        // Server call failed (likely no auth session in debug mode)
                        // Still proceed - the data just won't be persisted
                        print("Onboarding server call failed, proceeding anyway: \(error)")
                    }
                    authVM.completeOnboarding()
                }
            } label: {
                if vm.isSubmitting {
                    ProgressView()
                        .tint(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 56)
                        .background(Color.green)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                } else {
                    Text("Let's go")
                        .font(.title3.weight(.semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 56)
                        .background(Color.green)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                }
            }
            .disabled(vm.isSubmitting)
            .padding(.bottom, 60)
        }
        .padding(.horizontal, 24)
        .onAppear { showMessage = true }
    }
}

// MARK: - Shared Components

private struct ContinueButton: View {
    let enabled: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text("Continue")
                .font(.body.weight(.semibold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(enabled ? Color.green : Color(.systemGray4))
                .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .disabled(!enabled)
    }
}
