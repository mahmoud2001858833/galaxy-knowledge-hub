import { useNavigate } from 'react-router-dom';

export const useSimulationBack = () => {
  const navigate = useNavigate();
  const isGJUMode = sessionStorage.getItem('gju_mode') === 'true';
  
  const goBack = () => {
    if (isGJUMode) {
      navigate('/gju-competition');
    } else {
      navigate('/scientific-simulations');
    }
  };

  const backLabel = isGJUMode ? 'العودة لمستقبل التكنولوجيا' : 'العودة';

  return { goBack, backLabel, isGJUMode };
};
