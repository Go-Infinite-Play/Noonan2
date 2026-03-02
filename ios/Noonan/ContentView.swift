import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Image(systemName: "figure.golf")
                .imageScale(.large)
                .foregroundStyle(.tint)
            Text("Noonan")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("Your AI Golf Caddy")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding()
    }
}

#Preview {
    ContentView()
}
