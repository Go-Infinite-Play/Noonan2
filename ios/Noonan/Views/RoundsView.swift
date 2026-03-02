import SwiftUI

struct RoundsView: View {
    @StateObject private var viewModel = RoundsViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView()
                } else if viewModel.rounds.isEmpty {
                    ContentUnavailableView(
                        "No Rounds Yet",
                        systemImage: "flag.slash",
                        description: Text("Tell Noonan about your next round!")
                    )
                } else {
                    List(viewModel.rounds) { round in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(round.course?.name ?? "Unknown Course")
                                    .font(.headline)
                                Spacer()
                                if let score = round.score {
                                    Text("\(score)")
                                        .font(.title2)
                                        .fontWeight(.bold)
                                        .foregroundColor(.green)
                                }
                            }

                            Text(round.datePlayed)
                                .font(.caption)
                                .foregroundColor(.secondary)

                            if let highlights = round.highlights {
                                Text(highlights)
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                    .lineLimit(2)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
            .navigationTitle("My Rounds")
            .task {
                await viewModel.loadRounds()
            }
            .refreshable {
                await viewModel.loadRounds()
            }
        }
    }
}
