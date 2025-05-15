import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { StoryInput } from '../../types';
import { X, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { CardList, CalendarMinus, Cloud, Box } from 'react-bootstrap-icons';

interface Template {
  id: string;
  name: string;
  child_name: string;
  developmental_stage: string;
  language: string;
  developmental_needs: string[];
  reading_guidance: string;
  sleep_concerns: string[];
  story_theme: string;
}

interface TemplateListProps {
  onSelectTemplate: (template: Partial<StoryInput> & { id?: string }) => void;
  activeTemplateId: string | null;
  onClearTemplate: () => void;
}

const TemplateList: React.FC<TemplateListProps> = ({ 
  onSelectTemplate, 
  activeTemplateId,
  onClearTemplate 
}) => {
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('story_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  const handleDeleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('story_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTemplates(templates.filter(t => t.id !== id));
      if (id === activeTemplateId) {
        onClearTemplate();
      }
      toast.success('Template deleted');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  if (!user || templates.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-8 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <CardList className="w-5 h-5 text-accent-500" />
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Story Templates</h2>
      </div>

      <div className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="relative group cursor-pointer transition-all duration-300"
              onClick={() => {
                if (activeTemplateId === template.id) {
                  onClearTemplate();
                } else {
                  onSelectTemplate({
                    id: template.id,
                    childName: template.child_name,
                    developmentalStage: template.developmental_stage as any,
                    language: template.language as any,
                    developmentalNeeds: template.developmental_needs,
                    readingGuidance: template.reading_guidance as any,
                    sleepConcerns: template.sleep_concerns,
                    storyTheme: template.story_theme
                  });
                }
              }}
            >
              <div
                className={`
                  p-5 rounded-xl transition-all transform
                  ${activeTemplateId === template.id 
                    ? 'ring-2 ring-accent-500 shadow-lg bg-white scale-[1.02]' 
                    : 'bg-white shadow hover:shadow-lg hover:scale-[1.02]'
                  }
                `}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTemplate(template.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500 z-20"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CalendarMinus className="w-4 h-4" />
                      <span>Last used 2 days ago</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Cloud className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{template.language}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Box className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{template.developmental_stage}</span>
                    </div>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/75 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <button
                    className={`
                      py-2.5 px-6 rounded-lg transition-colors duration-200 text-sm font-medium
                      flex items-center justify-center gap-2 shadow-lg
                      ${activeTemplateId === template.id
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-accent-400 hover:bg-accent-500'
                      }
                      text-white
                    `}
                  >
                    <span>
                      {activeTemplateId === template.id ? 'Clear Template' : 'Use Template'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateList;