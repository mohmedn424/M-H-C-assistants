import { create } from 'zustand';
import pb from '../lib/pocketbase';

// Constants for Arabic text normalization
const ARABIC_REPLACEMENTS = {
  SPACES: /\s+/g,
  YA: /ى/g,
  ALEF: /أ|إ/g,
  TA_MARBUTA: 'ة',
  ABD_SPACE: 'عبد ',
};

/**
 * Patient query store for searching and managing patient data
 */
export const usePatientQuery = create((set, get) => ({
  queryResult: [],
  queryResultOptions: [],

  // Search for patients with normalized Arabic text
  queryPatient: (val) => {
    if (!val || val.length <= 1) return;

    const modifiedVal = val
      .replaceAll(ARABIC_REPLACEMENTS.SPACES, ' ')
      .replaceAll(ARABIC_REPLACEMENTS.YA, 'ي')
      .replaceAll(ARABIC_REPLACEMENTS.ALEF, 'ا')
      .replaceAll(ARABIC_REPLACEMENTS.TA_MARBUTA, 'ه')
      .replaceAll(ARABIC_REPLACEMENTS.ABD_SPACE, 'عبد');

    if (modifiedVal.length > 1) {
      fetchPatients(modifiedVal);
    }
  },

  // Set query results and format options for select component
  setQueryResult: (val) => {
    if (!Array.isArray(val)) return;

    const options = val.map((patient) => ({
      label: `${patient.name} | ${patient.address}`,
      value: patient.name,
      key: patient.id,
    }));

    set({
      queryResult: val,
      queryResultOptions: options,
    });
  },

  // Clear search results
  clearResults: () =>
    set({ queryResult: [], queryResultOptions: [] }),
}));

/**
 * Fetch patients from PocketBase with error handling
 */
const fetchPatients = async (searchVal) => {
  try {
    const finalSearch = searchVal.replace(/\s+/g, ' ').trim();
    if (!finalSearch) return;

    const resultList = await pb
      .collection('patients')
      .getList(1, 30, {
        filter: `name ~ "${finalSearch}"`,
        fields: 'name,address,id',
        sort: '-created',
      });

    usePatientQuery.getState().setQueryResult(resultList.items);
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    // Keep the previous state on error
    return;
  }
};

/**
 * Modal state for new patient form
 */
export const useNewPatientModal = create((set) => ({
  isModalOpen: false,
  setIsModalOpen: (isModalOpen) => set({ isModalOpen }),
}));

/**
 * Store for managing patient to be added to queue
 */
export const useToAddPatient = create((set) => ({
  toAddPatient: [],
  setToAddPatient: (toAddPatient) => set({ toAddPatient }),
  clearPatient: () => set({ toAddPatient: [] }),
}));

/**
 * Store for managing selected patient
 */
export const useSelectedPatient = create((set) => ({
  selectedPatient: [],
  setSelectedPatient: (selectedPatient) => set({ selectedPatient }),
  clearSelectedPatient: () => set({ selectedPatient: [] }),
}));

/**
 * Store for managing patient requested scans data
 */
export const usePatientRequestedScansData = create((set) => ({
  patientRequestedScansData: {},
  setPatientRequestedScansData: (patientRequestedScansData) =>
    set({ patientRequestedScansData }),
  clearScansData: () => set({ patientRequestedScansData: {} }),
}));
