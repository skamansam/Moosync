export abstract class GenericScrobbler {
  public abstract get loggedIn(): boolean

  public abstract login(): Promise<any>

  public abstract signOut(): Promise<void>

  public abstract getUserDetails(): Promise<string | undefined>

  public abstract scrobble(song: Song): Promise<void>
}