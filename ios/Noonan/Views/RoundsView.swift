import SwiftUI

struct RoundsView: View {
    var body: some View {
        NavigationStack {
            Text("No rounds yet. Go talk to Noonan!")
                .foregroundColor(.secondary)
                .navigationTitle("My Rounds")
        }
    }
}
