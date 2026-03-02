import SwiftUI

struct RoundsView: View {
    @StateObject private var viewModel = RoundsViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView()
                } else if viewModel.rounds.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "flag.fill")
                            .font(.system(size: 48))
                            .foregroundColor(.green.opacity(0.6))

                        Text("No rounds yet")
                            .font(.title2)
                            .fontWeight(.bold)

                        Text("Tell Noonan about a round you played.\nHe'll track everything for you.")
                            .font(.body)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)

                        Text("Head to Chat and say:\n\"I shot 95 at Bethpage Black\"")
                            .font(.callout)
                            .italic()
                            .foregroundColor(.green)
                            .multilineTextAlignment(.center)
                            .padding(.top, 8)
                    }
                    .padding(40)
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
