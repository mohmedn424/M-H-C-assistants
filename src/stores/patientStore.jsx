import { create } from 'zustand';

import pb from '../lib/pocketbase';

export const usePatientQuery = create((set) => ({
  queryResult: [],
  queryResultOptions: [],

  queryPatient: (val) => {
    const modifiedVal = val
      .replaceAll(/\s+/g, ' ')
      .replaceAll(/ى/g, 'ي')
      .replaceAll(/أ|إ/g, 'ا')
      .replaceAll('ة', 'ه')
      .replaceAll('عبد ', 'عبد');

    if (modifiedVal.length > 1) fetchPatients(modifiedVal);
  },

  setQueryResult: async (val) => {
    const options = val.map((patient) => ({
      label: `${patient.name} | ${patient.address}`,
      value: patient.name,
      key: patient.id,
    }));

    set({ queryResult: val });
    set({ queryResultOptions: options });
  },
}));

const setQueryResult = usePatientQuery.getState().setQueryResult;

const TimeStampGen = () => {
  return Math.round(Date.now() / 1000);
};

const fetchLogic = async (searchVal) => {
  const finalSearch = searchVal.replace(/\s+/g, ' ').trim();
  if (finalSearch === '') return;

  const resultList = await pb.collection('patients').getList(1, 30, {
    filter: `name ~ "${finalSearch}"`,
    fields: 'name,address,id',
    sort: '-created',
  });

  setQueryResult(resultList.items);
};

const fetchPatients = async (searchVal) => {
  fetchLogic(searchVal);
};

export const useNewPatientModal = create((set) => ({
  isModalOpen: false,
  setIsModalOpen: (isModalOpen) => set({ isModalOpen }),
}));

export const useToAddPatient = create((set) => ({
  toAddPatient: [],
  setToAddPatient: (toAddPatient) => set({ toAddPatient }),
}));

export const useSelectedPatient = create((set) => ({
  selectedPatient: [],
  setSelectedPatient: (selectedPatient) => set({ selectedPatient }),
}));

export const usePatientRequestedScansData = create((set) => ({
  patientRequestedScansData: {},
  setPatientRequestedScansData: (patientRequestedScansData) =>
    set({ patientRequestedScansData }),
}));
