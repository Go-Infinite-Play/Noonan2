import Foundation

@MainActor
class RoundsViewModel: ObservableObject {
    @Published var rounds: [Round] = []
    @Published var isLoading = false

    func loadRounds() async {
        isLoading = true
        do {
            rounds = try await supabase
                .from("rounds")
                .select("*, courses(*)")
                .order("date_played", ascending: false)
                .execute()
                .value
        } catch {
            print("Load rounds error: \(error)")
        }
        isLoading = false
    }
}
