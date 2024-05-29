export type ConnectionStatus = 'CONNECTED' | 'UNCONNECTED'

export interface UserSession {
  connectionStatus: ConnectionStatus
  userFullName: string
  userAvatar: string
  userId: string | undefined
  accessToken: string | undefined
  refreshToken: string | undefined
}
