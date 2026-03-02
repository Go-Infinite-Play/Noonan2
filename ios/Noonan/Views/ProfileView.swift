import SwiftUI

struct ProfileView: View {
    @ObservedObject var authVM: AuthViewModel

    var body: some View {
        NavigationStack {
            List {
                Button("Sign Out", role: .destructive) {
                    Task { await authVM.signOut() }
                }
            }
            .navigationTitle("Profile")
        }
    }
}
