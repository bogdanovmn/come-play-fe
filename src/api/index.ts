import { authApi, makeApiRequest } from './common'

// ===================== TYPES =====================

export interface ClubBrief {
  id: string
  name: string
  sportTypeId: number
  sportTypeName: string
  membersCount: number
}

export interface Club {
  id: string
  name: string
  sportTypeId: number
  sportTypeName: string
  ownerId: string
  ownerName: string
  description: string | null
  closed: boolean
  createdAt: string
}

export interface InvitationBrief {
  id: string
  name: string
  joinedCount: number
}

export interface Invitation {
  id: string
  clubId: string
  name: string
  createdBy: string
  createdAt: string
}

export interface InvitationInfo {
  id: string
  clubId: string
  clubName: string
  name: string
}

export interface TrainingBrief {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  maxPlayers: number
}

export interface TrainingSlot {
  id: string
  trainingId: string
  slotDate: string
  dayOfWeek: string
  startTime: string
  endTime: string
  enrolledCount: number
  maxPlayers: number
  commentsCount: number
}

export interface Enrollment {
  slotId: string
  userId?: string
  friendId?: string
  name: string
  enrolledBy: string
  enrolledAt: string
}

export interface Comment {
  id: string
  slotId: string
  userId: string
  authorName: string
  text: string
  createdAt: string
}

export interface SportType {
  id: number
  name: string
}

export interface UserProfile {
  id: string
  displayName: string
}

export interface FriendBrief {
  id: string
  name: string
}

export interface VisitByDay {
  date: string
  visitCount: number
}

export interface VisitByPlayer {
  userId: string
  visitCount: number
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

// ===================== CLUB API =====================

export async function listOwnedClubs(): Promise<ClubBrief[]> {
  return authApi.get<ClubBrief[]>('/clubs/owned')
}

export async function listMemberClubs(): Promise<ClubBrief[]> {
  return authApi.get<ClubBrief[]>('/clubs/member')
}

export async function getClub(clubId: string): Promise<Club> {
  return authApi.get<Club>(`/clubs/${clubId}`)
}

export async function createClub(name: string, sportTypeId: number): Promise<ClubBrief> {
  return authApi.post<ClubBrief>('/clubs', { name, sportTypeId })
}

export async function updateClub(clubId: string, name: string, description: string | null, sportTypeId: number): Promise<void> {
  return authApi.put(`/clubs/${clubId}`, { name, description, sportTypeId })
}

export async function closeClub(clubId: string): Promise<void> {
  return authApi.put(`/clubs/${clubId}/close`)
}

// ===================== INVITATION API =====================

export async function listInvitations(clubId: string): Promise<InvitationBrief[]> {
  return authApi.get<InvitationBrief[]>(`/clubs/${clubId}/invitations`)
}

export async function createInvitation(clubId: string, name: string): Promise<Invitation> {
  return authApi.post<Invitation>(`/clubs/${clubId}/invitations`, { name })
}

export async function joinByInvitation(invitationId: string): Promise<void> {
  return authApi.post(`/clubs/invitations/${invitationId}/join`)
}

export async function getInvitationInfo(invitationId: string): Promise<InvitationInfo> {
  return makeApiRequest<InvitationInfo>('get', `/clubs/invitations/${invitationId}`)
}

// ===================== TRAINING API =====================

export async function listTrainings(clubId: string): Promise<TrainingBrief[]> {
  return authApi.get<TrainingBrief[]>(`/clubs/${clubId}/trainings`)
}

export async function createTraining(
  clubId: string,
  dayOfWeek: DayOfWeek,
  startTime: string,
  endTime: string,
  maxPlayers: number
): Promise<TrainingBrief> {
  return authApi.post<TrainingBrief>(`/clubs/${clubId}/trainings`, {
    dayOfWeek, startTime, endTime, maxPlayers
  })
}

export async function deleteTraining(clubId: string, trainingId: string): Promise<void> {
  return authApi.delete(`/clubs/${clubId}/trainings/${trainingId}`)
}

export async function updateTraining(
  clubId: string,
  trainingId: string,
  dayOfWeek: DayOfWeek,
  startTime: string,
  endTime: string,
  maxPlayers: number
): Promise<TrainingBrief> {
  return authApi.put<TrainingBrief>(`/clubs/${clubId}/trainings/${trainingId}`, {
    dayOfWeek, startTime, endTime, maxPlayers
  })
}

export async function listSlots(clubId: string, from: string, to: string): Promise<TrainingSlot[]> {
  return authApi.get<TrainingSlot[]>(`/clubs/${clubId}/trainings/slots`, { from, to })
}

export async function getSlot(slotId: string): Promise<TrainingSlot> {
  return authApi.get<TrainingSlot>(`/slots/${slotId}`)
}

export async function listSlotsByTraining(clubId: string, trainingId: string): Promise<TrainingSlot[]> {
  return authApi.get<TrainingSlot[]>(`/clubs/${clubId}/trainings/${trainingId}/slots`)
}

// ===================== ENROLLMENT API =====================

export async function enroll(slotId: string, friendId?: string): Promise<void> {
  return authApi.post(`/slots/${slotId}/enroll`, friendId ? { friendId } : {})
}

export async function unenroll(slotId: string, friendId?: string): Promise<void> {
  return authApi.delete(`/slots/${slotId}/enroll`, friendId ? { friendId } : {})
}

export async function listEnrollments(slotId: string): Promise<Enrollment[]> {
  return authApi.get<Enrollment[]>(`/slots/${slotId}/enrollments`)
}

// ===================== COMMENT API =====================

export async function listComments(slotId: string): Promise<Comment[]> {
  return authApi.get<Comment[]>(`/slots/${slotId}/comments`)
}

export async function createComment(slotId: string, text: string): Promise<Comment> {
  return authApi.post<Comment>(`/slots/${slotId}/comments`, { text })
}

// ===================== USER API =====================

export async function getProfile(): Promise<UserProfile> {
  return authApi.get<UserProfile>('/users/me')
}

export async function updateProfile(displayName: string): Promise<void> {
  return authApi.put('/users/me', { displayName })
}

export async function listFriends(): Promise<FriendBrief[]> {
  return authApi.get<FriendBrief[]>('/users/me/friends')
}

export async function addFriend(name: string): Promise<void> {
  return authApi.post('/users/me/friends', { name })
}

export async function removeFriend(friendId: string): Promise<void> {
  return authApi.delete(`/users/me/friends/${friendId}`)
}

// ===================== SPORT TYPE API =====================

export async function listSportTypes(): Promise<SportType[]> {
  return authApi.get<SportType[]>('/sport-types')
}

export async function createSportType(name: string): Promise<SportType> {
  return authApi.post<SportType>('/sport-types', { name })
}

// ===================== HISTORY API =====================

export async function visitByDay(clubId: string, from: string, to: string): Promise<VisitByDay[]> {
  return authApi.get<VisitByDay[]>(`/clubs/${clubId}/history/by-day`, { from, to })
}

export async function visitByPlayer(clubId: string, from: string, to: string): Promise<VisitByPlayer[]> {
  return authApi.get<VisitByPlayer[]>(`/clubs/${clubId}/history/by-player`, { from, to })
}
