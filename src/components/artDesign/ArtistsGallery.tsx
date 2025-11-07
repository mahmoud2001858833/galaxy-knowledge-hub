import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Artist {
  id: string;
  name: string;
  birth_year: string;
  death_year: string;
  nationality: string;
  biography: string;
  famous_works: string[];
  art_style: string;
  image_url: string;
}

const ArtistsGallery = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .order("name");

      if (error) throw error;
      setArtists(data || []);
    } catch (error: any) {
      toast.error("فشل تحميل الفنانين");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">جاري التحميل...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {artists.map((artist) => (
        <Dialog key={artist.id}>
          <DialogTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="cursor-pointer"
            >
              <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={artist.image_url}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg">{artist.name}</h3>
                    <p className="text-white/80 text-sm">
                      {artist.birth_year} - {artist.death_year}
                    </p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <Badge variant="secondary">{artist.art_style}</Badge>
                  <p className="text-sm text-muted-foreground mt-2">{artist.nationality}</p>
                </CardContent>
              </Card>
            </motion.div>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{artist.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <img
                src={artist.image_url}
                alt={artist.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-right">السيرة الذاتية</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed text-right">{artist.biography}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-right">الأعمال الشهيرة</h4>
                  <ul className="list-disc list-inside space-y-1 text-right">
                    {artist.famous_works.map((work, index) => (
                      <li key={index} className="text-sm text-muted-foreground" dir="rtl">
                        {work}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center gap-4 flex-wrap justify-end text-right" dir="rtl">
                  <span className="text-sm text-muted-foreground">
                    {artist.birth_year} - {artist.death_year}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {artist.nationality}
                  </span>
                  <Badge>{artist.art_style}</Badge>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </motion.div>
  );
};

export default ArtistsGallery;
