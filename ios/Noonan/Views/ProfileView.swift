import SwiftUI

struct ProfileView: View {
    @ObservedObject var authVM: AuthViewModel
    @StateObject private var viewModel = ProfileViewModel()
    @State private var displayName = ""
    @State private var handicapText = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Your Info") {
                    TextField("Display Name", text: $displayName)
                        .onSubmit {
                            Task { await viewModel.updateDisplayName(displayName) }
                        }

                    TextField("Handicap", text: $handicapText)
                        .keyboardType(.decimalPad)
                        .onSubmit {
                            let handicap = Double(handicapText)
                            Task { await viewModel.updateHandicap(handicap) }
                        }
                }

                Section {
                    Button("Sign Out", role: .destructive) {
                        Task { await authVM.signOut() }
                    }
                }
            }
            .navigationTitle("Profile")
            .task {
                await viewModel.loadProfile()
                displayName = viewModel.user?.displayName ?? ""
                if let h = viewModel.user?.handicap {
                    handicapText = String(format: "%.1f", h)
                }
            }
        }
    }
}
