/**
 * Generic class for Recommendations providers
 */
export abstract class GenericRecommendation {
  /**
   * logged in status
   */
  public abstract get loggedIn(): boolean

  /**
   * Login auth handler for provider
   * @returns Promise returned after login event is completed
   */
  public abstract login(): Promise<any>

  /**
   * Sign out handler for provider
   * @returns Promise returned after sign out event is completed
   */
  public abstract signOut(): Promise<void>

  /**
   * Gets user details from the provider
   * @returns username as string
   */
  public abstract getUserDetails(): Promise<string | undefined>

  /**
   * Gets recommendations
   * @returns recommendations 
   */
  public abstract getRecommendations(): Promise<Recommendations>
}