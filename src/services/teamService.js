import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'team_members';

const getStoredMembers = () => {
  try {
    const storedMembers = localStorage.getItem(STORAGE_KEY);
    const members = storedMembers ? JSON.parse(storedMembers) : [];
    console.log('Retrieved stored members:', members);
    return members;
  } catch (error) {
    console.error('Error getting stored members:', error);
    return [];
  }
};

const saveMembers = (members) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    console.log('Saved members:', members);
  } catch (error) {
    console.error('Error saving members:', error);
  }
};

export const teamService = {
  getMembers() {
    return getStoredMembers();
  },

  getMembersByBoard(boardId) {
    if (!boardId) {
      console.error('No boardId provided to getMembersByBoard');
      return [];
    }

    try {
      const members = getStoredMembers();
      const boardMembers = members.filter(member => 
        member && 
        member.boardIds && 
        Array.isArray(member.boardIds) && 
        member.boardIds.includes(boardId)
      );
      console.log('Members for board:', { boardId, members: boardMembers });
      return boardMembers;
    } catch (error) {
      console.error('Error getting members by board:', error);
      return [];
    }
  },

  addMemberToBoard(user, boardId) {
    if (!user || !boardId) {
      console.error('Invalid user or boardId:', { user, boardId });
      return null;
    }
    
    console.log('Adding member to board:', { user, boardId });
    const members = getStoredMembers();
    const existingMember = members.find(m => m.email === user.email);

    if (existingMember) {
      if (!existingMember.boardIds.includes(boardId)) {
        existingMember.boardIds.push(boardId);
        saveMembers(members);
        console.log('Updated existing member:', existingMember);
      }
      return existingMember;
    }

    const newMember = {
      id: user.id || uuidv4(),
      email: user.email,
      name: user.name || user.email.split('@')[0],
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=random`,
      status: 'online',
      boardIds: [boardId],
      joinedAt: new Date().toISOString(),
      role: user.role || 'member'
    };

    members.push(newMember);
    saveMembers(members);
    console.log('Added new member:', newMember);
    return newMember;
  },

  inviteMember(email, boardId, role = 'member', name = '') {
    if (!email || !boardId) {
      console.error('Invalid email or boardId:', { email, boardId });
      return null;
    }
    
    const members = getStoredMembers();
    const existingMember = members.find(m => m.email === email);

    if (existingMember) {
      if (!existingMember.boardIds.includes(boardId)) {
        existingMember.boardIds.push(boardId);
        if (name && !existingMember.name) {
          existingMember.name = name;
        }
        saveMembers(members);
        console.log('Updated existing invited member:', existingMember);
      }
      return existingMember;
    }

    const memberName = name || email.split('@')[0];
    const newMember = {
      id: uuidv4(),
      email,
      name: memberName,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=random`,
      status: 'offline',
      boardIds: [boardId],
      joinedAt: new Date().toISOString(),
      role
    };

    members.push(newMember);
    saveMembers(members);
    console.log('Added new invited member:', newMember);
    return newMember;
  },

  removeMember(memberId, boardId) {
    if (!memberId || !boardId) {
      console.error('Invalid memberId or boardId:', { memberId, boardId });
      return;
    }
    
    const members = getStoredMembers();
    const memberIndex = members.findIndex(m => m.id === memberId);
    
    if (memberIndex !== -1) {
      const member = members[memberIndex];
      member.boardIds = member.boardIds.filter(id => id !== boardId);
      
      if (member.boardIds.length === 0) {
        members.splice(memberIndex, 1);
      }
      
      saveMembers(members);
      console.log('Removed member from board:', { memberId, boardId, remainingBoards: member.boardIds });
    }
  },

  updateMemberStatus(memberId, status) {
    if (!memberId) {
      console.error('Invalid memberId:', memberId);
      return;
    }
    
    const members = getStoredMembers();
    const member = members.find(m => m.id === memberId);
    
    if (member) {
      member.status = status;
      saveMembers(members);
      console.log('Updated member status:', { memberId, status });
      return member;
    }
  }
}; 