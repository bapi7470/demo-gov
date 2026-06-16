import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

const DEFAULT_BENEFICIARIES = {
  YUVSTH001A: {
    name: 'Rahul Kumar Das',
    mobile: '9800000001',
    schemes: [{ id: 'yuva-sathi', name: 'Jubo Shakti', stateId: 'central', benefit: '₹3,000/month' }],
    status: 'active',
    employer: null,
    appliedOn: '2026-01-10',
  },
  YUVSTH002B: {
    name: 'Priya Mondal',
    mobile: '9800000002',
    schemes: [{ id: 'yuva-sathi', name: 'Jubo Shakti', stateId: 'central', benefit: '₹3,000/month' }],
    status: 'active',
    employer: null,
    appliedOn: '2026-01-12',
  },
  YUVSTH003C: {
    name: 'Amit Sharma',
    mobile: '9800000003',
    schemes: [{ id: 'yuva-sathi', name: 'Jubo Shakti', stateId: 'central', benefit: '₹3,000/month' }],
    status: 'active',
    employer: null,
    appliedOn: '2026-01-15',
  },
  PANKSH004D: {
    name: 'Sunita Devi',
    mobile: '9800000004',
    schemes: [{ id: 'yuva-sathi', name: 'Jubo Shakti', stateId: 'central', benefit: '₹3,000/month' }],
    status: 'active',
    employer: null,
    appliedOn: '2026-01-18',
  },
};

export function AppProvider({ children }) {
  const [beneficiaries, setBeneficiaries] = useState({});
  const [companyEmployees, setCompanyEmployees] = useState({});

  const fetchAllData = useCallback(async () => {
    try {
      const [benRes, _] = await Promise.allSettled([
        fetch('/api/beneficiaries'),
      ]);

      if (benRes.status === 'fulfilled' && benRes.value.ok) {
        const data = await benRes.value.json();
        const byPan = {};
        if (Array.isArray(data)) {
          data.forEach((b) => {
            if (b.pan) byPan[b.pan] = b;
          });
        } else if (data && typeof data === 'object') {
          Object.assign(byPan, data);
        }

        if (Object.keys(byPan).length === 0) {
          await seedDefaults();
        } else {
          setBeneficiaries(byPan);
        }
      }
    } catch (err) {
      console.error('[AppContext] Failed to fetch beneficiaries:', err);
    }
  }, []);

  const seedDefaults = useCallback(async () => {
    const entries = Object.entries(DEFAULT_BENEFICIARIES);
    const results = await Promise.allSettled(
      entries.map(([pan, data]) =>
        fetch('/api/beneficiaries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pan, ...data }),
        })
      )
    );

    const seeded = {};
    results.forEach((r, i) => {
      const [pan, data] = entries[i];
      if (r.status === 'fulfilled' && r.value.ok) {
        seeded[pan] = data;
      }
    });

    if (Object.keys(seeded).length === 0) {
      setBeneficiaries({ ...DEFAULT_BENEFICIARIES });
    } else {
      setBeneficiaries(seeded);
    }
  }, []);

  const fetchEmployees = useCallback(async (orgId) => {
    try {
      const res = await fetch(`/api/employees?orgId=${encodeURIComponent(orgId)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('[AppContext] Failed to fetch employees for org:', orgId, err);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const refreshData = useCallback(async () => {
    await fetchAllData();

    const orgIds = Object.keys(companyEmployees);
    if (orgIds.length > 0) {
      const updated = {};
      await Promise.all(
        orgIds.map(async (orgId) => {
          updated[orgId] = await fetchEmployees(orgId);
        })
      );
      setCompanyEmployees((prev) => ({ ...prev, ...updated }));
    }
  }, [fetchAllData, fetchEmployees, companyEmployees]);

  const registerSchemeBeneficiary = useCallback(async (pan, name, mobile, schemeInfo) => {
    const payload = {
      pan,
      name,
      mobile,
      schemes: Array.isArray(schemeInfo) ? schemeInfo : [schemeInfo],
      status: 'active',
      employer: null,
      appliedOn: new Date().toISOString().split('T')[0],
    };

    const res = await fetch('/api/beneficiaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to register beneficiary: ${res.statusText}`);
    }

    const saved = await res.json();
    setBeneficiaries((prev) => ({
      ...prev,
      [pan]: saved.pan ? saved : { ...payload, ...saved },
    }));

    return saved;
  }, []);

  const isPanEmployed = useCallback(
    (pan) => {
      const b = beneficiaries[pan];
      return b?.status === 'suspended';
    },
    [beneficiaries]
  );

  const addCompanyEmployee = useCallback(
    async (orgId, orgName, employee) => {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, orgName, employee }),
      });

      if (!res.ok) {
        throw new Error(`Failed to add employee: ${res.statusText}`);
      }

      const saved = await res.json();

      setCompanyEmployees((prev) => {
        const existing = prev[orgId] || [];
        const withoutDup = existing.filter(
          (e) => e.pan !== (employee.pan || employee.uid)
        );
        return { ...prev, [orgId]: [...withoutDup, saved.employee || employee] };
      });

      if (employee.pan) {
        const benPayload = {
          pan: employee.pan,
          status: 'suspended',
          employer: { orgId, orgName },
        };

        try {
          const benRes = await fetch('/api/beneficiaries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(benPayload),
          });

          if (benRes.ok) {
            setBeneficiaries((prev) => ({
              ...prev,
              [employee.pan]: {
                ...(prev[employee.pan] || {}),
                status: 'suspended',
                employer: { orgId, orgName },
              },
            }));
          }
        } catch (err) {
          console.error('[AppContext] Failed to update beneficiary status:', err);
        }
      }

      return saved;
    },
    []
  );

  const removeCompanyEmployee = useCallback(
    async (orgId, pan) => {
      const employees = companyEmployees[orgId] || [];
      const employee = employees.find((e) => e.pan === pan || e.uid === pan);
      const uid = employee?.uid || pan;

      const res = await fetch(`/api/employees/${encodeURIComponent(uid)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId }),
      });

      if (!res.ok) {
        throw new Error(`Failed to remove employee: ${res.statusText}`);
      }

      setCompanyEmployees((prev) => {
        const existing = prev[orgId] || [];
        return {
          ...prev,
          [orgId]: existing.filter((e) => e.pan !== pan && e.uid !== pan),
        };
      });

      if (pan) {
        const benPayload = {
          pan,
          status: 'active',
          employer: null,
        };

        try {
          const benRes = await fetch('/api/beneficiaries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(benPayload),
          });

          if (benRes.ok) {
            setBeneficiaries((prev) => ({
              ...prev,
              [pan]: {
                ...(prev[pan] || {}),
                status: 'active',
                employer: null,
              },
            }));
          }
        } catch (err) {
          console.error('[AppContext] Failed to update beneficiary status:', err);
        }
      }
    },
    [companyEmployees]
  );

  const getCompanyEmployees = useCallback(
    async (orgId) => {
      if (companyEmployees[orgId]) {
        return companyEmployees[orgId];
      }

      const employees = await fetchEmployees(orgId);
      setCompanyEmployees((prev) => ({ ...prev, [orgId]: employees }));
      return employees;
    },
    [companyEmployees, fetchEmployees]
  );

  const getBeneficiaryByPan = useCallback(
    (pan) => beneficiaries[pan] || null,
    [beneficiaries]
  );

  const getAllBeneficiaries = useCallback(
    () => ({ ...beneficiaries }),
    [beneficiaries]
  );

  const value = {
    beneficiaries,
    companyEmployees,
    registerSchemeBeneficiary,
    isPanEmployed,
    addCompanyEmployee,
    removeCompanyEmployee,
    getCompanyEmployees,
    getBeneficiaryByPan,
    getAllBeneficiaries,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}

export default AppContext;
