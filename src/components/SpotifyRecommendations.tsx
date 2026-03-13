import React, { useState, useEffect } from 'react';
import { Music, Loader2 } from 'lucide-react';

interface SpotifyRecommendationsProps {
  moodSummary: string;
  reasoning: string;
  score: number;
}

interface SpotifyTrack {
  name: string;
  artist: string;
  uri: string;
  embedUrl: string;
  type: 'track' | 'playlist' | 'podcast';
}

const SpotifyRecommendations: React.FC<SpotifyRecommendationsProps> = ({ 
  moodSummary, 
  reasoning, 
  score 
}) => {
  const [recommendations, setRecommendations] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateSpotifyRecommendations();
  }, [moodSummary, reasoning]);

  const generateSpotifyRecommendations = async () => {
    setIsLoading(true);
    try {
      // Directly use curated playlists - they always work!
      const curatedPlaylists = getCuratedPlaylists(score);
      setRecommendations(curatedPlaylists);
      
    } catch (error) {
      console.error('Error generating Spotify recommendations:', error);
      // Fallback to curated playlists
      setRecommendations(getCuratedPlaylists(score));
    } finally {
      setIsLoading(false);
    }
  };

  const getCuratedPlaylists = (score: number): SpotifyTrack[] => {
    // Curated Spotify playlist IDs
    if (score < 30) {
      return [
        {
          name: "Peaceful Piano",
          artist: "Spotify",
          uri: "spotify:playlist:37i9dQZF1DX4sWSpwq3LiO",
          embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator",
          type: 'playlist'
        },
        {
          name: "Stress Relief",
          artist: "Spotify",
          uri: "spotify:playlist:37i9dQZF1DWXe9gFZP0gtP",
          embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWXe9gFZP0gtP?utm_source=generator",
          type: 'playlist'
        },
        {
          name: "Calm Nature Sounds",
          artist: "Spotify",
          uri: "spotify:playlist:37i9dQZF1DX4PP3DA4J0N8",
          embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX4PP3DA4J0N8?utm_source=generator",
          type: 'playlist'
        }
      ];
    } else if (score < 60) {
      return [
        {
          name: "Chill Vibes",
          artist: "Spotify",
          uri: "spotify:playlist:37i9dQZF1DWYcDQ1hSjOpY",
          embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWYcDQ1hSjOpY?utm_source=generator",
          type: 'playlist'
        },
        {
          name: "Deep Focus",
          artist: "Spotify",
          uri: "spotify:playlist:37i9dQZF1DWZeKCadgRdKQ",
          embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator",
          type: 'playlist'
        },
        {
          name: "Peaceful Guitar",
          artist: "Spotify",
          uri: "spotify:playlist:37i9dQZF1DX0jgyAiPl8Af",
          embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX0jgyAiPl8Af?utm_source=generator",
          type: 'playlist'
        }
      ];
    } else {
      return [
        {
          name: "Happy Hits",
          artist: "Spotify",
          uri: "spotify:playlist:37i9dQZF1DXdPec7aLTmlC",
          embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DXdPec7aLTmlC?utm_source=generator",
          type: 'playlist'
        },
        {
          name: "Mood Booster",
          artist: "Spotify",
          uri: "spotify:playlist:37i9dQZF1DX3rxVfibe1L0",
          embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX3rxVfibe1L0?utm_source=generator",
          type: 'playlist'
        },
        {
          name: "Feel Good Indie Rock",
          artist: "Spotify",
          uri: "spotify:playlist:37i9dQZF1DX2sUQwD7tbmL",
          embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX2sUQwD7tbmL?utm_source=generator",
          type: 'playlist'
        }
      ];
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-green-400" />
          <p className="text-white/90">Finding perfect music for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-500/30">
        <div className="flex items-center space-x-3 mb-2">
          <Music className="w-6 h-6 text-green-400" />
          <h3 className="text-2xl font-bold text-white">Personalized Music</h3>
        </div>
        <p className="text-white/70 text-sm">
          Based on your assessment, we've curated music to support your current state
        </p>
      </div>

      {/* Full Spotify Playlist Embeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((track, index) => (
          <div 
            key={index}
            className="bg-black/40 rounded-xl p-4 border border-white/10 hover:border-green-400/50 transition-all"
            data-aos="fade-up"
            data-aos-duration={800 + (index * 200)}
          >
            <h4 className="text-white font-semibold mb-3 text-center">{track.name}</h4>
            <iframe
              src={track.embedUrl}
              width="100%"
              height="380"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-lg"
            />
          </div>
        ))}
      </div>

      {/* Info Note */}
      <p className="text-white/50 text-xs text-center">
        💡 These playlists are curated based on your mood assessment. Press play to start listening!
      </p>
    </div>
  );
};

export default SpotifyRecommendations;
