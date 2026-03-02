import Foundation
import SwiftUI

enum HandicapRange: String, CaseIterable, Identifiable {
    case beginner = "Just starting out"
    case breaking100 = "Break 100 sometimes"
    case nineties = "Usually 90s"
    case eighties = "Usually 80s"
    case lowHandicap = "Low handicapper"

    var id: String { rawValue }

    var estimatedHandicap: Double {
        switch self {
        case .beginner: return 36
        case .breaking100: return 28
        case .nineties: return 20
        case .eighties: return 12
        case .lowHandicap: return 5
        }
    }

    var noonanDescription: String {
        switch self {
        case .beginner: return "just getting started"
        case .breaking100: return "chasing that 99"
        case .nineties: return "a 90s shooter"
        case .eighties: return "an 80s player"
        case .lowHandicap: return "actually good at this"
        }
    }
}

enum PlayFrequency: String, CaseIterable, Identifiable {
    case rarely = "A few times a year"
    case monthly = "Once or twice a month"
    case weekly = "Every week"
    case obsessed = "As much as humanly possible"

    var id: String { rawValue }
}

enum GameWeakness: String, CaseIterable, Identifiable {
    case driver = "Driver"
    case irons = "Irons"
    case shortGame = "Short game"
    case putting = "Putting"
    case courseManagement = "Course management"
    case mentalGame = "Mental game"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .driver: return "figure.golf"
        case .irons: return "arrow.up.forward"
        case .shortGame: return "target"
        case .putting: return "circle.dotted"
        case .courseManagement: return "map"
        case .mentalGame: return "brain.head.profile"
        }
    }
}

@MainActor
class OnboardingViewModel: ObservableObject {
    @Published var currentStep = 0
    @Published var firstName = ""
    @Published var handicapRange: HandicapRange = .nineties
    @Published var playFrequency: PlayFrequency = .monthly
    @Published var weakness: GameWeakness = .driver
    @Published var isSubmitting = false
    @Published var error: String?

    let totalSteps = 4

    var noonanIntroMessage: String {
        let name = firstName.trimmingCharacters(in: .whitespaces)
        return "Alright \(name), I'm Noonan. I'm your caddy now. " +
            "You're \(handicapRange.noonanDescription) who struggles with \(weakness.rawValue.lowercased())? " +
            "I've seen worse. Let's fix that.\n\n" +
            "Tell me about your last round — even just the score and where you played."
    }

    func canAdvance() -> Bool {
        switch currentStep {
        case 0: return !firstName.trimmingCharacters(in: .whitespaces).isEmpty
        default: return true
        }
    }

    func advance() {
        if currentStep < totalSteps - 1 {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) {
                currentStep += 1
            }
        }
    }

    func goBack() {
        if currentStep > 0 {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) {
                currentStep -= 1
            }
        }
    }

    func completeOnboarding() async throws {
        isSubmitting = true
        error = nil

        defer { isSubmitting = false }

        struct OnboardingRequest: Encodable {
            let display_name: String
            let handicap_range: String
            let estimated_handicap: Double
            let play_frequency: String
            let weakness: String
        }

        let body = OnboardingRequest(
            display_name: firstName.trimmingCharacters(in: .whitespaces),
            handicap_range: handicapRange.rawValue,
            estimated_handicap: handicapRange.estimatedHandicap,
            play_frequency: playFrequency.rawValue,
            weakness: weakness.rawValue
        )

        do {
            try await supabase.functions.invoke(
                "complete-onboarding",
                options: .init(body: body)
            )
        } catch {
            self.error = "Something went wrong. Try again?"
            throw error
        }
    }
}
