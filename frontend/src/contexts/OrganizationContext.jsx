import { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { organizationsApi } from '../api/endpoints';
const Context = createContext(null);
export function OrganizationProvider({children}) {
  const {slug} = useParams();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reload = async () => {
    const {data} = await organizationsApi.get(slug);
    setOrganization(data); return data;
  };
  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setOrganization(null);
    organizationsApi.get(slug).then(({data}) => { if (active) setOrganization(data); })
      .catch(() => { if (active) setError('Workspace not found or you do not have access.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);
  return <Context.Provider value={{slug, organization, loading, error, reload, canWrite: ['owner','admin','manager'].includes(organization?.my_role), canAdmin: ['owner','admin'].includes(organization?.my_role), isOwner: organization?.my_role === 'owner'}}>{children}</Context.Provider>;
}
export const useOrganization = () => useContext(Context);
