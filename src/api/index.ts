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
  active: boolean
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

export interface InvitationJoiner {
  userId: string
  name: string
  registeredAt: string
}

export interface TrainingBrief {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  maxPlayers: number
  features: string | null
}

export interface TrainingSlot {
  id: string
  trainingId: string
  clubId: string
  clubName: string
  slotDate: string
  dayOfWeek: string
  startTime: string
  endTime: string
  enrolledCount: number
  maxPlayers: number
  commentsCount: number
  features: string | null
  overridden: boolean
  cancelled: boolean
  enrolled: boolean
}

export interface Enrollment {
  slotId: string
  userId?: string
  friendId?: string
  name: string
  enrolledBy: string
  enrolledAt: string
  comingLater: boolean
  skill: SkillLevel | null
  owner: boolean
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

export interface ClubMember {
  id: string
  name: string
  skill: SkillLevel | null
  owner: boolean
  overridden: boolean
}

export interface PlayerSkill {
  sportTypeId: number
  sportTypeName: string
  skill: SkillLevel
}

export interface SportSkillUpdate {
  sportTypeId: number
  skill: SkillLevel | null
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

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export const SKILL_LABELS: Record<SkillLevel, string> = {
  [SkillLevel.BEGINNER]: 'Начинающий',
  [SkillLevel.INTERMEDIATE]: 'Продолжающий',
  [SkillLevel.ADVANCED]: 'Продвинутый',
  [SkillLevel.EXPERT]: 'Эксперт',
}

export const SKILL_LEVELS: SkillLevel[] = Object.values(SkillLevel)

export interface VisitByDay {
  date: string
  visitCount: number
}

export interface VisitByPlayer {
  userId: string
  visitCount: number
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

export async function openClub(clubId: string): Promise<void> {
  return authApi.put(`/clubs/${clubId}/open`)
}

export async function listClubMembers(clubId: string): Promise<ClubMember[]> {
  return authApi.get<ClubMember[]>(`/clubs/${clubId}/members`)
}

export async function setMemberSkill(clubId: string, memberId: string, skill: SkillLevel): Promise<void> {
  return authApi.put(`/clubs/${clubId}/members/${memberId}/skill`, { skill })
}

export async function clearMemberSkill(clubId: string, memberId: string): Promise<void> {
  return authApi.delete(`/clubs/${clubId}/members/${memberId}/skill`)
}

export async function leaveClub(clubId: string): Promise<void> {
  return authApi.delete(`/clubs/${clubId}/members`)
}

// ===================== INVITATION API =====================

export async function listInvitations(clubId: string): Promise<InvitationBrief[]> {
  return authApi.get<InvitationBrief[]>(`/clubs/${clubId}/invitations`)
}

export async function createInvitation(clubId: string, name: string): Promise<Invitation> {
  return authApi.post<Invitation>(`/clubs/${clubId}/invitations`, { name })
}

export async function deleteInvitation(clubId: string, invitationId: string): Promise<void> {
  return authApi.delete(`/clubs/${clubId}/invitations/${invitationId}`)
}

export async function joinByInvitation(invitationId: string): Promise<void> {
  return authApi.post(`/clubs/invitations/${invitationId}/join`)
}

export async function getInvitationInfo(invitationId: string): Promise<InvitationInfo> {
  return makeApiRequest<InvitationInfo>('get', `/clubs/invitations/${invitationId}`)
}

export async function listInvitationJoiners(clubId: string, invitationId: string): Promise<InvitationJoiner[]> {
  return authApi.get<InvitationJoiner[]>(`/clubs/${clubId}/invitations/${invitationId}/joiners`)
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
  maxPlayers: number,
  features: string | null
): Promise<TrainingBrief> {
  return authApi.post<TrainingBrief>(`/clubs/${clubId}/trainings`, {
    dayOfWeek, startTime, endTime, maxPlayers, features
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
  maxPlayers: number,
  features: string | null
): Promise<TrainingBrief> {
  return authApi.put<TrainingBrief>(`/clubs/${clubId}/trainings/${trainingId}`, {
    dayOfWeek, startTime, endTime, maxPlayers, features
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

export async function updateSlotParams(
  slotId: string,
  startTime: string,
  endTime: string,
  maxPlayers: number,
  features: string | null
): Promise<TrainingSlot> {
  return authApi.put<TrainingSlot>(`/slots/${slotId}/params`, {
    startTime, endTime, maxPlayers, features
  })
}

export async function clearSlotParams(slotId: string): Promise<TrainingSlot> {
  return authApi.delete<TrainingSlot>(`/slots/${slotId}/params`)
}

export async function cancelSlot(slotId: string): Promise<TrainingSlot> {
  return authApi.put<TrainingSlot>(`/slots/${slotId}/cancel`)
}

export async function restoreSlot(slotId: string): Promise<TrainingSlot> {
  return authApi.delete<TrainingSlot>(`/slots/${slotId}/cancel`)
}

export async function listHistorySlots(clubId: string, days: number): Promise<TrainingSlot[]> {
  return authApi.get<TrainingSlot[]>(`/clubs/${clubId}/history`, { days })
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

export async function setComingLater(slotId: string, comingLater: boolean): Promise<void> {
  return authApi.put(`/slots/${slotId}/coming-later`, { comingLater })
}

// ===================== COMMENT API =====================

export async function listComments(slotId: string): Promise<Comment[]> {
  return authApi.get<Comment[]>(`/slots/${slotId}/comments`)
}

export async function createComment(slotId: string, text: string): Promise<Comment> {
  return authApi.post<Comment>(`/slots/${slotId}/comments`, { text })
}

// ===================== PROFILE API =====================

export async function getProfile(): Promise<UserProfile> {
  return authApi.get<UserProfile>('/profile')
}

export async function saveSettings(displayName: string, sportSkills: SportSkillUpdate[]): Promise<void> {
  return authApi.put('/profile/settings', { displayName, sportSkills })
}

export async function listFriends(): Promise<FriendBrief[]> {
  return authApi.get<FriendBrief[]>('/profile/friends')
}

export async function addFriend(name: string): Promise<void> {
  return authApi.post('/profile/friends', { name })
}

export async function removeFriend(friendId: string): Promise<void> {
  return authApi.delete(`/profile/friends/${friendId}`)
}

export async function listMySportSkills(): Promise<PlayerSkill[]> {
  return authApi.get<PlayerSkill[]>('/profile/sport-skills')
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
