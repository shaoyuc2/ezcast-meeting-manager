
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  query,
  orderBy 
} from 'firebase/firestore';
import { FIREBASE_CONFIG } from '../constants';
import { TeamMember, AssignmentMap } from '../types';

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

// 監聽成員列表
export const subscribeToMembers = (callback: (members: TeamMember[]) => void) => {
  const q = query(collection(db, 'members'), orderBy('name'));
  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
    callback(members);
  });
};

// 監聽指派任務
export const subscribeToAssignments = (callback: (assignments: AssignmentMap) => void) => {
  return onSnapshot(collection(db, 'assignments'), (snapshot) => {
    const assignments: AssignmentMap = {};
    snapshot.docs.forEach(doc => {
      assignments[doc.id] = doc.data().memberId;
    });
    callback(assignments);
  });
};

// 操作成員
export const addMember = async (name: string) => {
  const id = Date.now().toString();
  await setDoc(doc(db, 'members', id), { name });
};

export const removeMember = async (id: string) => {
  await deleteDoc(doc(db, 'members', id));
};

// 更新指派 (現在 assignmentKey 是 bookingId + guestEmail 的複合鍵)
export const updateAssignment = async (assignmentKey: string, memberId: string) => {
  if (!memberId) {
    await deleteDoc(doc(db, 'assignments', assignmentKey));
  } else {
    await setDoc(doc(db, 'assignments', assignmentKey), { memberId });
  }
};
