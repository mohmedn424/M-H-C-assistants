import { create } from 'zustand';

import pb from '../lib/pocketbase';

// const LOCALSTORAGE_TOKEN_DURATION = 86400;

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

  // resultList.items.length > 0 &&
  //   localStorage.setItem(
  //     searchVal,
  //     JSON.stringify({
  //       items: [...resultList.items],
  //       timeStamp: TimeStampGen(),
  //     })
  //   );

  setQueryResult(resultList.items);
};

const fetchPatients = async (searchVal) => {
  if (localStorage.getItem(searchVal)) {
    // const local = JSON.parse(localStorage.getItem(searchVal));
    // const localStamp = local.timeStamp;

    // TimeStampGen() - localStamp > LOCALSTORAGE_TOKEN_DURATION
    //   ? fetchLogic()
    //   : setQueryResult(local.items);
    fetchLogic(searchVal);
  } else {
    fetchLogic(searchVal);
  }
};
