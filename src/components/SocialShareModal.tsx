import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Heart,
  Sparkles,
  Users,
  ShieldCheck,
  Send,
  Globe,
} from 'lucide-react';
import { SupportedLanguage } from '../types';

export interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: SupportedLanguage;
  customTitle?: string;
  customText?: string;
  customUrl?: string;
  category?: 'general' | 'kick_counter' | 'emergency' | 'facility';
}

export interface SocialHandle {
  id: string;
  platform: string;
  handle: string;
  badge: string;
  url: string;
  iconBg: string;
  textColor: string;
  borderColor: string;
  description: string;
  followers?: string;
  actionText: string;
}

export const SOCIAL_HANDLES: SocialHandle[] = [
  {
    id: 'whatsapp',
    platform: 'WhatsApp Community',
    handle: '+234 800 MAMAG CARE',
    badge: 'Mothers & CHWs Circle',
    url: 'https://chat.whatsapp.com/invite/MamaGMaternalCare',
    iconBg: 'bg-emerald-500/15',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    description: 'Daily pregnancy tips, peer mother support groups & instant midwife triage assistance.',
    followers: '45k+ Sisters & CHWs',
    actionText: 'Join WhatsApp Group',
  },
  {
    id: 'twitter',
    platform: 'X (formerly Twitter)',
    handle: '@MamaGHealth',
    badge: 'Official Handle',
    url: 'https://x.com/MamaGHealth',
    iconBg: 'bg-stone-800',
    textColor: 'text-stone-200',
    borderColor: 'border-stone-700 hover:border-stone-500',
    description: 'Evidence-based maternal health updates, WHO/FMOH clinical alerts & digital public health discussions.',
    followers: '28k Followers',
    actionText: 'Follow @MamaGHealth',
  },
  {
    id: 'instagram',
    platform: 'Instagram',
    handle: '@mamag.health',
    badge: 'Visual Guides',
    url: 'https://instagram.com/mamag.health',
    iconBg: 'bg-rose-500/15',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/30 hover:border-rose-400',
    description: 'Weekly baby milestone infographics, nutritious local recipes, and self-care tips for mothers.',
    followers: '32k Followers',
    actionText: 'Follow on Instagram',
  },
  {
    id: 'facebook',
    platform: 'Facebook',
    handle: 'Mama-G Maternal Health Network',
    badge: 'Community Page',
    url: 'https://facebook.com/mamaghealth',
    iconBg: 'bg-blue-600/15',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30 hover:border-blue-400',
    description: 'Connect with healthcare workers, post-natal recovery circles, and community health forums across Africa.',
    followers: '50k+ Members',
    actionText: 'Visit Facebook Page',
  },
  {
    id: 'telegram',
    platform: 'Telegram Channel',
    handle: '@MamaGHealthBot',
    badge: 'Offline Updates',
    url: 'https://t.me/mamaghealth',
    iconBg: 'bg-sky-500/15',
    textColor: 'text-sky-400',
    borderColor: 'border-sky-500/30 hover:border-sky-400',
    description: 'Low-bandwidth clinical alerts, offline medication reminders, and health guides directly in Telegram.',
    followers: '19k Subscribers',
    actionText: 'Join Telegram Channel',
  },
  {
    id: 'tiktok',
    platform: 'TikTok',
    handle: '@mamaghealth',
    badge: 'Midwife Tips',
    url: 'https://tiktok.com/@mamaghealth',
    iconBg: 'bg-stone-800',
    textColor: 'text-amber-300',
    borderColor: 'border-amber-500/30 hover:border-amber-400',
    description: 'Short 60-second midwife tips, labor prep videos, and confidential youth SRHR guidance in local dialects.',
    followers: '68k Community',
    actionText: 'Watch on TikTok',
  },
  {
    id: 'youtube',
    platform: 'YouTube Health Clinic',
    handle: '@mamaghealth',
    badge: 'Video Explanations',
    url: 'https://youtube.com/@mamaghealth',
    iconBg: 'bg-red-500/15',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30 hover:border-red-400',
    description: 'Full video walkthroughs of labor preparation, fetal kick counting, newborn CPR, and VVF care recovery.',
    followers: '15k Subscribers',
    actionText: 'Subscribe on YouTube',
  },
  {
    id: 'linkedin',
    platform: 'LinkedIn',
    handle: 'Mama-G Digital Health Initiative',
    badge: 'Public Health DPG',
    url: 'https://linkedin.com/company/mamaghealth',
    iconBg: 'bg-blue-500/15',
    textColor: 'text-blue-300',
    borderColor: 'border-blue-500/30 hover:border-blue-400',
    description: 'UNICEF Digital Public Goods compliance, clinical triage research, and frontline health worker impact reports.',
    followers: '8k Professionals',
    actionText: 'Connect on LinkedIn',
  },
];

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  language = 'English',
  customTitle,
  customText,
  customUrl,
  category = 'general',
}) => {
  const [activeTab, setActiveTab] = useState<'share' | 'handles'>('share');
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0);

  if (!isOpen) return null;

  const appUrl = customUrl || (typeof window !== 'undefined' ? window.location.href : 'https://mama-g.health');

  // Pre-crafted share templates based on context & language
  const shareTemplates = [
    {
      id: 'general',
      title: 'Recommend Mama-G to a Sister',
      message: `🌺 Check out Mama-G Maternal & Women's Health Assistant! It gives free 42-week pregnancy tracking, baby kick alarms, confidential symptom triage, and works offline for phones & laptops. Safe motherhood for all: ${appUrl}`,
    },
    {
      id: 'kick_counter',
      title: 'Share Baby Kick Count',
      message: `🤰 Baby is active and kicking! Just completed a fetal kick count session on Mama-G. Tracking fetal movements protects our little one: ${appUrl}`,
    },
    {
      id: 'emergency',
      title: 'Emergency Maternal Alert',
      message: `🚨 Maternal Emergency Support: Access Mama-G emergency triage protocol and nearest health centers across 774 LGAs: ${appUrl}`,
    },
    {
      id: 'pidgin',
      title: 'Nigerian Pidgin',
      message: `🌺 My sister, check Mama-G! E get free pregnancy tracking, kick counter, nurse advice, and e dey work even when you no get internet: ${appUrl}`,
    },
    {
      id: 'swahili',
      title: 'Swahili',
      message: `🌺 Msaidizi wa Mama-G kwa afya ya uzazi na wanawake! Kufuatilia ujauzito wa wiki 42, harakati za mtoto, na mwongozo wa afya hata bila mtandao: ${appUrl}`,
    },
    {
      id: 'hausa',
      title: 'Hausa',
      message: `🌺 Ga taimakon Mama-G don lafiyar mata da ciki! Kula da ci gaban ciki, motsin jariri, da shawarar likita koda babu intanet: ${appUrl}`,
    },
    {
      id: 'yoruba',
      title: 'Yoruba',
      message: `🌺 Ẹ wo Mama-G fun ilera awọn iya ati alaboyun! Titele oyun ọsẹ 42, kika iṣẹju ọmọ inu, ati imọran ilera ọfẹ: ${appUrl}`,
    },
  ];

  const currentShareText = customText || shareTemplates[selectedTemplate].message;
  const currentTitle = customTitle || "Mama-G | Maternal & Women's Health Assistant";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentShareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: currentTitle,
          text: currentShareText,
          url: appUrl,
        });
      } catch (err) {
        // User cancelled or browser rejected
      }
    } else {
      handleCopyLink();
    }
  };

  // Direct Social Share URLs
  const encodedText = encodeURIComponent(currentShareText);
  const encodedUrl = encodeURIComponent(appUrl);

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&hashtags=MamaG,MaternalHealth,SafeMotherhood`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="social-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="social-modal-title" className="text-base sm:text-lg font-bold text-white">
                  Connect & Share Mama-G
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  @MamaGHealth
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Join our official social handles & share lifesaving maternal tools with mothers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 p-2 bg-stone-950 border-b border-stone-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('share')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'share'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>1-Click Share App</span>
          </button>
          <button
            onClick={() => setActiveTab('handles')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'handles'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Official Handles (8 Channels)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'share' ? (
            <>
              {/* Template Picker */}
              <div>
                <label className="text-xs font-bold text-stone-300 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Choose Share Message Template:</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {shareTemplates.map((tmpl, idx) => (
                    <button
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(idx)}
                      className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        selectedTemplate === idx
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                          : 'bg-stone-950/80 text-stone-400 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      {tmpl.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Preview Box */}
              <div className="relative bg-stone-950 border border-stone-800 rounded-2xl p-3.5 sm:p-4 text-xs text-stone-300 leading-relaxed font-sans">
                <p className="whitespace-pre-wrap">{currentShareText}</p>
                <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Free & Anonymous DPG</span>
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors font-medium cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-400" />
                        <span>Copy Text & Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Direct Social Channels Grid */}
              <div>
                <h3 className="text-xs font-bold text-stone-300 mb-2.5 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant Dispatch to Major Social Platforms:</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {/* WhatsApp */}
                  <a
                    href={shareLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-950/70 text-emerald-200 transition-all shadow-sm group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-lg shrink-0">
                      💬
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold group-hover:text-white truncate">WhatsApp</div>
                      <div className="text-[10px] text-emerald-400/80 truncate">Family & CHWs</div>
                    </div>
                  </a>

                  {/* X (Twitter) */}
                  <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-950 border border-stone-700/80 hover:border-stone-500 hover:bg-stone-800/60 text-stone-100 transition-all shadow-sm group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-stone-800 flex items-center justify-center text-sm font-black shrink-0">
                      𝕏
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold group-hover:text-amber-300 truncate">Post on X</div>
                      <div className="text-[10px] text-stone-400 truncate">#MamaGHealth</div>
                    </div>
                  </a>

                  {/* Facebook */}
                  <a
                    href={shareLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-950/70 text-blue-200 transition-all shadow-sm group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-600/20 flex items-center justify-center text-sm font-bold text-blue-400 shrink-0">
                      f
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold group-hover:text-white truncate">Facebook</div>
                      <div className="text-[10px] text-blue-400/80 truncate">Groups & Feed</div>
                    </div>
                  </a>

                  {/* Telegram */}
                  <a
                    href={shareLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-sky-950/40 border border-sky-500/30 hover:border-sky-400 hover:bg-sky-950/70 text-sky-200 transition-all shadow-sm group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center text-lg shrink-0">
                      ✈️
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold group-hover:text-white truncate">Telegram</div>
                      <div className="text-[10px] text-sky-400/80 truncate">Channels & Chats</div>
                    </div>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href={shareLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-blue-950/30 border border-blue-500/20 hover:border-blue-400 hover:bg-blue-950/60 text-blue-200 transition-all shadow-sm group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-300 shrink-0">
                      in
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold group-hover:text-white truncate">LinkedIn</div>
                      <div className="text-[10px] text-blue-400/80 truncate">Global Health</div>
                    </div>
                  </a>

                  {/* Native Device Share / More */}
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/20 text-amber-200 transition-all shadow-sm group text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold group-hover:text-white truncate">More Options</div>
                      <div className="text-[10px] text-amber-400/80 truncate">Phone Share Menu</div>
                    </div>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Official Handles Directory */
            <div className="space-y-3">
              <div className="bg-stone-950 border border-stone-800 rounded-2xl p-3.5 flex items-center justify-between text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌺</span>
                  <span>
                    Verified Official Organization Handles for <strong className="text-amber-300">Mama-G Digital Health</strong>
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  ✓ Verified DPG
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SOCIAL_HANDLES.map((handle) => (
                  <a
                    key={handle.id}
                    href={handle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3.5 rounded-2xl bg-stone-950/70 border ${handle.borderColor} transition-all flex flex-col justify-between gap-3 group`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl ${handle.iconBg} flex items-center justify-center text-sm font-bold ${handle.textColor} shrink-0`}>
                            {handle.id === 'whatsapp'
                              ? '💬'
                              : handle.id === 'twitter'
                              ? '𝕏'
                              : handle.id === 'facebook'
                              ? 'f'
                              : handle.id === 'instagram'
                              ? '📷'
                              : handle.id === 'tiktok'
                              ? '🎵'
                              : handle.id === 'youtube'
                              ? '▶'
                              : handle.id === 'telegram'
                              ? '✈️'
                              : 'in'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                              <span>{handle.platform}</span>
                            </div>
                            <div className={`text-[11px] font-mono font-medium ${handle.textColor}`}>
                              {handle.handle}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 font-semibold border border-stone-700/60">
                          {handle.badge}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-400 mt-2 line-clamp-2 leading-relaxed">
                        {handle.description}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
                      {handle.followers && (
                        <span className="text-stone-400 flex items-center gap-1">
                          <Users className="w-3 h-3 text-stone-400" />
                          <span>{handle.followers}</span>
                        </span>
                      )}
                      <span className={`font-bold ${handle.textColor} group-hover:underline flex items-center gap-1 ml-auto`}>
                        <span>{handle.actionText}</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-stone-950 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-stone-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Mama-G: Maternal health for all sisters, regardless of connectivity</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
