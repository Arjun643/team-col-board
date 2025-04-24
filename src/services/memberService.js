import { store } from '../redux/store';
import { addMember, addInvite, removeMember, removeInvite } from '../redux/slices/membersSlice';
import activityService from './activityService';

class MemberService {
  // Simulate sending an email invitation
  inviteMember(email) {
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        store.dispatch(addInvite({ email }));
        resolve({ success: true, message: 'Invitation sent successfully' });
      }, 1000);
    });
  }

  // Simulate accepting an invitation
  acceptInvite(inviteId, memberData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMember = {
          id: Date.now().toString(),
          joinedAt: new Date().toISOString(),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(memberData.name)}&background=random`,
          ...memberData,
        };

        store.dispatch(addMember(newMember));
        store.dispatch(removeInvite(inviteId));
        activityService.trackMemberJoined(memberData.name);
        
        resolve({ success: true, member: newMember });
      }, 1000);
    });
  }

  // Remove a member from the team
  removeMember(memberId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        store.dispatch(removeMember(memberId));
        resolve({ success: true, message: 'Member removed successfully' });
      }, 1000);
    });
  }

  // Get all team members
  getMembers() {
    return store.getState().members.members;
  }

  // Get pending invites
  getPendingInvites() {
    return store.getState().members.invitePending;
  }

  // Get member by ID
  getMemberById(memberId) {
    return this.getMembers().find(member => member.id === memberId);
  }
}

export default new MemberService(); 