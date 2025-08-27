/**
 * Stats Service for tracking user eco-friendly actions and leaderboard updates
 */

interface UserStats {
  totalScans: number;
  ecoPoints: number;
  productsScanned: number;
  alternativesFound: number;
  co2Saved: number;
  sustainabilityRating: string;
  achievements: string[];
  lastScanDate: string;
}

interface LeaderboardEntry {
  username: string;
  ecoPoints: number;
  totalScans: number;
  co2Saved: number;
  rank: number;
}

export class StatsService {
  private static readonly STORAGE_KEY = 'ecosnap_user_stats';
  private static readonly LEADERBOARD_KEY = 'ecosnap_leaderboard';

  /**
   * Get current user stats
   */
  static getUserStats(): UserStats {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Default stats for new users
    return {
      totalScans: 0,
      ecoPoints: 0,
      productsScanned: 0,
      alternativesFound: 0,
      co2Saved: 0.0,
      sustainabilityRating: 'Eco Rookie',
      achievements: [],
      lastScanDate: new Date().toISOString(),
    };
  }

  /**
   * Update stats after a successful product scan
   */
  static updateAfterScan(product: any, foundAlternatives: number = 0): UserStats {
    const currentStats = this.getUserStats();
    
    // Calculate points based on product eco score
    const basePoints = Math.floor(product.ecoScore / 10);
    const alternativeBonus = foundAlternatives * 5;
    const totalPoints = basePoints + alternativeBonus + 10; // Base 10 points per scan

    // Calculate CO2 saved (estimated based on eco-friendly choice)
    const co2Reduction = product.ecoScore > 70 ? Math.random() * 0.5 + 0.2 : 0.1;

    const updatedStats: UserStats = {
      totalScans: currentStats.totalScans + 1,
      ecoPoints: currentStats.ecoPoints + totalPoints,
      productsScanned: currentStats.productsScanned + 1,
      alternativesFound: currentStats.alternativesFound + foundAlternatives,
      co2Saved: +(currentStats.co2Saved + co2Reduction).toFixed(2),
      sustainabilityRating: this.calculateRating(currentStats.ecoPoints + totalPoints),
      achievements: this.checkAchievements(currentStats, {
        totalScans: currentStats.totalScans + 1,
        ecoPoints: currentStats.ecoPoints + totalPoints,
      }),
      lastScanDate: new Date().toISOString(),
    };

    // Save updated stats
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedStats));
    
    // Update leaderboard
    this.updateLeaderboard(updatedStats);

    return updatedStats;
  }

  /**
   * Calculate sustainability rating based on eco points
   */
  private static calculateRating(ecoPoints: number): string {
    if (ecoPoints >= 1000) return 'Eco Champion';
    if (ecoPoints >= 500) return 'Sustainability Expert';
    if (ecoPoints >= 250) return 'Green Guardian';
    if (ecoPoints >= 100) return 'Eco Enthusiast';
    if (ecoPoints >= 50) return 'Green Learner';
    return 'Eco Rookie';
  }

  /**
   * Check for new achievements
   */
  private static checkAchievements(oldStats: UserStats, newPartialStats: { totalScans: number; ecoPoints: number }): string[] {
    const achievements = [...oldStats.achievements];
    
    // Scan-based achievements
    if (newPartialStats.totalScans >= 10 && !achievements.includes('First 10 Scans')) {
      achievements.push('First 10 Scans');
    }
    if (newPartialStats.totalScans >= 50 && !achievements.includes('Half Century')) {
      achievements.push('Half Century');
    }
    if (newPartialStats.totalScans >= 100 && !achievements.includes('Scan Master')) {
      achievements.push('Scan Master');
    }

    // Points-based achievements
    if (newPartialStats.ecoPoints >= 100 && !achievements.includes('Eco Points Collector')) {
      achievements.push('Eco Points Collector');
    }
    if (newPartialStats.ecoPoints >= 500 && !achievements.includes('Sustainability Champion')) {
      achievements.push('Sustainability Champion');
    }
    if (newPartialStats.ecoPoints >= 1000 && !achievements.includes('Eco Legend')) {
      achievements.push('Eco Legend');
    }

    // Special achievements
    if (oldStats.co2Saved >= 5.0 && !achievements.includes('CO2 Saver')) {
      achievements.push('CO2 Saver');
    }

    return achievements;
  }

  /**
   * Update global leaderboard
   */
  private static updateLeaderboard(userStats: UserStats): void {
    const currentUser = 'EcoUser' + Math.floor(Math.random() * 1000); // In real app, get from auth
    
    let leaderboard: LeaderboardEntry[] = [];
    const stored = localStorage.getItem(this.LEADERBOARD_KEY);
    if (stored) {
      leaderboard = JSON.parse(stored);
    }

    // Update or add current user
    const existingIndex = leaderboard.findIndex(entry => entry.username === currentUser);
    const newEntry: LeaderboardEntry = {
      username: currentUser,
      ecoPoints: userStats.ecoPoints,
      totalScans: userStats.totalScans,
      co2Saved: userStats.co2Saved,
      rank: 0, // Will be calculated
    };

    if (existingIndex >= 0) {
      leaderboard[existingIndex] = newEntry;
    } else {
      leaderboard.push(newEntry);
    }

    // Add some demo users if leaderboard is too small
    if (leaderboard.length < 10) {
      const demoUsers = [
        { username: 'EcoMaster', ecoPoints: 1250, totalScans: 89, co2Saved: 12.4 },
        { username: 'GreenGuru', ecoPoints: 980, totalScans: 67, co2Saved: 8.9 },
        { username: 'SustainableSam', ecoPoints: 756, totalScans: 45, co2Saved: 6.2 },
        { username: 'EcoExplorer', ecoPoints: 623, totalScans: 38, co2Saved: 5.1 },
        { username: 'NatureNinja', ecoPoints: 445, totalScans: 29, co2Saved: 3.8 },
        { username: 'GreenScanner', ecoPoints: 334, totalScans: 22, co2Saved: 2.9 },
        { username: 'EcoNewbie', ecoPoints: 178, totalScans: 15, co2Saved: 1.4 },
      ];

      demoUsers.forEach(demo => {
        if (!leaderboard.find(entry => entry.username === demo.username)) {
          leaderboard.push({ ...demo, rank: 0 });
        }
      });
    }

    // Sort by eco points and assign ranks
    leaderboard.sort((a, b) => b.ecoPoints - a.ecoPoints);
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Keep only top 50
    leaderboard = leaderboard.slice(0, 50);

    localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(leaderboard));
  }

  /**
   * Get leaderboard data
   */
  static getLeaderboard(): LeaderboardEntry[] {
    const stored = localStorage.getItem(this.LEADERBOARD_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  /**
   * Get user's rank in leaderboard
   */
  static getUserRank(): number {
    const leaderboard = this.getLeaderboard();
    const currentUser = 'EcoUser' + Math.floor(Math.random() * 1000); // In real app, get from auth
    const userEntry = leaderboard.find(entry => entry.username === currentUser);
    return userEntry?.rank || -1;
  }

  /**
   * Reset user stats (for testing)
   */
  static resetUserStats(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Export stats for sharing
   */
  static exportStats(): string {
    const stats = this.getUserStats();
    return JSON.stringify(stats, null, 2);
  }
}
