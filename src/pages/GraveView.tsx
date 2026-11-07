import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Grave } from '../types';
import { GraveModal } from '../components/GraveModal';
import { Loader2 } from 'lucide-react';
import { trackPageView } from '../services/analyticsService';

export const GraveView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [grave, setGrave] = useState<Grave | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGrave = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'graves', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setGrave({ id: docSnap.id, ...docSnap.data() } as Grave);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrave();
  }, [id]);

  // Dynamically update document title & meta tags for social shareability
  useEffect(() => {
    if (!grave) return;

    const previousTitle = document.title;
    const newTitle = `${grave.project_name} | Dev Graveyard Memorial`;
    document.title = newTitle;

    const descContent = `Memorial for "${grave.project_name}". Cause of Death: ${grave.cause_of_death}. "${grave.lesson_learned || 'May its code rest in peace.'}" — Laid to rest in the Dev Graveyard.`;

    const setOrCreateMeta = (attrName: string, attrVal: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrVal);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
      return meta;
    };

    const descMeta = setOrCreateMeta('name', 'description', descContent);
    const ogTitleMeta = setOrCreateMeta('property', 'og:title', newTitle);
    const ogDescMeta = setOrCreateMeta('property', 'og:description', descContent);
    const twTitleMeta = setOrCreateMeta('name', 'twitter:title', newTitle);
    const twDescMeta = setOrCreateMeta('name', 'twitter:description', descContent);

    trackPageView(`/grave/${grave.id}`, newTitle);

    return () => {
      document.title = previousTitle;
    };
  }, [grave]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#c53030] animate-spin" />
      </div>
    );
  }

  if (!grave) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Grave Not Found</h2>
        <button onClick={() => navigate('/cemetery')} className="text-[#c53030] hover:underline font-mono">Return to Graveyard</button>
      </div>
    );
  }

  // Use a transparent full-screen div to host the modal
  return (
    <div className="fixed inset-0 z-50">
      <GraveModal grave={grave} onClose={() => navigate('/cemetery')} />
    </div>
  );
};
