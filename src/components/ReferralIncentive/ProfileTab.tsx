// ProfileTab.tsx
import React, { useState } from 'react';
import {
  Share2,
  Link,
  Copy,
  Check,
  Smartphone,
  Globe,
  ExternalLink,
  ChevronsUpDown,
  CheckIcon,
  MessageCircle,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Send,
  MessageSquare,
  Mail,
  Link2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProfileTabProps {
  loading: boolean;
}

interface ShortLinkResponse {
  message: {
    status: string;
    data: {
      status: number;
      reason: string;
      shortLink: string;
    };
  };
}

interface Deeplink {
  name: string;
  deeplink: string;
  user_code: string;
  campaign: string;
  created_time: string;
}

interface DeeplinksResponse {
  message: {
    status: string;
    count: number;
    data: Deeplink[];
  };
}

const ProfileTab: React.FC<ProfileTabProps> = ({ loading }) => {
  const { token, user } = useAuth();
  const [selectedSource, setSelectedSource] = useState('WHATSAPP');
  const [campaignTag, setCampaignTag] = useState('');
  const [shortLink, setShortLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  
  const [deeplinks, setDeeplinks] = useState<Deeplink[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      fetchDeeplinks();
    }
  }, [user]);

  const fetchDeeplinks = async () => {
    setIsLoadingLinks(true);
    try {
      const response = await fetch('/api/method/rms.apuser.getlink', {
        headers: {
          'token': token
        }
      });
      if (response.ok) {
        const data: DeeplinksResponse = await response.json();
        if (data.message?.status === 'success' && data.message.data) {
          setDeeplinks(data.message.data);
        }
      }
    } catch (err) {
      console.error('Error fetching deeplinks:', err);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  const socialMediaSources = [
    { id: 'WHATSAPP', name: 'WhatsApp', icon: MessageCircle },
    { id: 'FACEBOOK', name: 'Facebook', icon: Facebook },
    { id: 'INSTAGRAM', name: 'Instagram', icon: Instagram },
    { id: 'TWITTER', name: 'Twitter', icon: Twitter },
    { id: 'LINKEDIN', name: 'LinkedIn', icon: Linkedin },
    { id: 'TELEGRAM', name: 'Telegram', icon: Send },
    { id: 'SMS', name: 'SMS', icon: MessageSquare },
    { id: 'EMAIL', name: 'Email', icon: Mail },
    { id: 'OTHER', name: 'Other', icon: Link2 },
  ];

  const selectedSourceData = socialMediaSources.find(source => source.id === selectedSource);
  const SelectedIcon = selectedSourceData?.icon || Link2;

  const generateReferralLink = async () => {
    if (!user) {
      setError('User not found. Please try again.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const finalTag = selectedSource === 'OTHER' ? campaignTag : selectedSource;
      const longLink = `https://www.gopocket.in/open-account-call-back?refer=${user.ap_code}&src=${user.user_code}&tag=${encodeURIComponent(finalTag)}`;

      // Send to webhook to get short link
      const response = await fetch('/api/method/rms.apuser.link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        mode: 'cors',
        body: JSON.stringify({
          link: longLink,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate short link');
      }

      const data: ShortLinkResponse = await response.json();

      // Updated to handle the nested response structure
      if (data.message && data.message.data && data.message.data.status === 1) {
        setShortLink(data.message.data.shortLink);
        // Refresh the list after successful generation
        fetchDeeplinks();
      } else {
        throw new Error(data.message?.data?.reason || 'Failed to generate short link');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while generating the link';
      setError(errorMessage);
      console.error('Error generating referral link:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shortLink) return;

    try {
      await navigator.clipboard.writeText(shortLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setError('Failed to copy to clipboard');
    }
  };

  const copySpecificLink = async (link: string, id: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLinkId(id);
      setTimeout(() => setCopiedLinkId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const shareSpecificLink = async (link: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Open Your Pocket Trading Account',
          text: 'Join me on Pocket Trading and start your investment journey!',
          url: link,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        copySpecificLink(link, 'share-fallback');
      }
    } else {
      copySpecificLink(link, 'share-fallback');
    }
  };

  const handleMobileShare = async () => {
    if (!shortLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Open Your Pocket Trading Account',
          text: 'Join me on Pocket Trading and start your investment journey!',
          url: shortLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        // Fallback to copy if share is cancelled or fails
        copyToClipboard();
      }
    } else {
      // Fallback to copy if Web Share API is not supported
      copyToClipboard();
    }
  };

  const openLink = () => {
    if (shortLink) {
      window.open(shortLink, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <span className="text-sm font-medium">Error: {error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Input Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Your Link</h3>

          {/* Social Media Source Selection - Combobox */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Platform
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <div className="flex items-center gap-3">
                  <SelectedIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">{selectedSourceData?.name}</span>
                </div>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </button>

              {open && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  <div className="p-1">
                    {socialMediaSources.map((source) => {
                      const IconComponent = source.icon;
                      return (
                        <button
                          key={source.id}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md hover:bg-gray-100 ${selectedSource === source.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                          onClick={() => {
                            setSelectedSource(source.id);
                            setOpen(false);
                          }}
                        >
                          <IconComponent className="h-5 w-5" />
                          <span className="flex-1">{source.name}</span>
                          {selectedSource === source.id && (
                            <CheckIcon className="h-4 w-4 text-blue-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Other Platform Input (Max 10 chars) */}
          {selectedSource === 'OTHER' && (
            <div className="mb-6">
              <label htmlFor="otherTag" className="block text-sm font-medium text-gray-700 mb-2">
                Specify Platform Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="otherTag"
                placeholder="e.g. YouTube"
                maxLength={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={campaignTag}
                onChange={(e) => setCampaignTag(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum 10 characters. Alphanumeric only.
              </p>
            </div>
          )}

          {/* Campaign Tag Input (Commented out by user)
          <div className="mb-6">
            <label htmlFor="campaignTag" className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name (Optional)
            </label>
            <input
              type="text"
              id="campaignTag"
              placeholder="Enter campaign name for tracking"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={campaignTag}
              onChange={(e) => setCampaignTag(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              This helps you track performance for different campaigns
            </p>
          </div> */}

          {/* Generate Button */}
          <button
            onClick={generateReferralLink}
            disabled={isGenerating || (selectedSource === 'OTHER' && !campaignTag)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            <Link size={20} />
            {isGenerating ? 'Generating Short Link...' : 'Generate Referral Link'}
          </button>
        </div>

        {/* Right Column - Generated Link */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Link</h3>

          {shortLink && (
            <div className="space-y-4">
              {/* Short Link Display */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-sm text-green-600 mb-2 font-medium">Your Shareable Link:</div>
                <div className="text-green-700 font-medium break-all flex items-center gap-2 justify-between">
                  <span className="flex-1">{shortLink}</span>
                  <button
                    onClick={openLink}
                    className="text-green-600 hover:text-green-800 transition-colors flex-shrink-0"
                    title="Open link"
                  >
                    <ExternalLink size={18} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Copy Short Link Button */}
                <button
                  onClick={copyToClipboard}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {isCopied ? <Check size={20} /> : <Copy size={20} />}
                  <span className="hidden sm:inline">
                    {isCopied ? 'Copied!' : 'Copy Link'}
                  </span>
                  <span className="sm:hidden">Copy</span>
                </button>

                {/* Mobile Share Button */}
                <button
                  onClick={handleMobileShare}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 sm:hidden"
                >
                  <Smartphone size={20} />
                  Share
                </button>

                {/* Desktop Share Info */}
                <div className="hidden sm:flex flex-1 items-center justify-center gap-2 text-gray-500">
                  <Globe size={20} />
                  <span className="text-sm">Ready to share</span>
                </div>
              </div>

              {/* Mobile Instructions */}
              <div className="sm:hidden bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 text-blue-800 mb-1">
                  <Smartphone size={16} />
                  <span className="text-sm font-medium">Mobile Sharing</span>
                </div>
                <p className="text-xs text-blue-700">
                  Tap "Share" to open sharing options and send via WhatsApp, Messages, or other apps.
                </p>
              </div>
            </div>
          )}

          {/* Deep Links History */}
          <div className="mt-8">
            <h4 className="text-md font-semibold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
              <span>Link History</span>
              {isLoadingLinks && <span className="text-xs text-gray-500 font-normal">Loading...</span>}
            </h4>

            {deeplinks.length > 0 ? (
              <ScrollArea className="h-64 pr-4">
                <div className="space-y-4">
                  {deeplinks.map((item, index) => {
                    // Find icon for campaign
                    const sourceData = socialMediaSources.find(s => s.id === item.campaign || s.name.toUpperCase() === item.campaign.toUpperCase());
                    const ItemIcon = sourceData?.icon || Link2;
                    const isItemCopied = copiedLinkId === item.name;

                    return (
                      <div key={item.name || index} className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="bg-white p-1.5 rounded-md shadow-sm border border-gray-200">
                              <ItemIcon size={14} className="text-blue-600" />
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-gray-700 block">{item.campaign}</span>
                              <span className="text-[10px] text-gray-500">
                                {new Date(item.created_time).toLocaleDateString()} {new Date(item.created_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            <button
                              onClick={() => copySpecificLink(item.deeplink, item.name)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Copy link"
                            >
                              {isItemCopied ? <Check size={14} className="text-green-600"/> : <Copy size={14} />}
                            </button>
                            <button
                              onClick={() => shareSpecificLink(item.deeplink)}
                              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors sm:hidden"
                              title="Share link"
                            >
                              <Share2 size={14} />
                            </button>
                            <a
                              href={item.deeplink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Open link"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                        <div className="text-xs text-blue-600 font-medium bg-white px-2 py-1.5 rounded border border-gray-200 truncate">
                          {item.deeplink}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              !isLoadingLinks && (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                  <p className="text-gray-500 text-sm">No link history found</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Statistics & Tips */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sharing Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-lg">💡</div>
            <div>
              <h4 className="font-medium text-gray-900">Best Practices</h4>
              <p className="text-sm text-gray-600">Share personalized messages with your link for better conversion.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">📊</div>
            <div>
              <h4 className="font-medium text-gray-900">Track Performance</h4>
              <p className="text-sm text-gray-600">Use different campaign names to track which sources perform best.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">🔗</div>
            <div>
              <h4 className="font-medium text-gray-900">Short Links</h4>
              <p className="text-sm text-gray-600">We provide short links that are easier to share and track.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">📱</div>
            <div>
              <h4 className="font-medium text-gray-900">Mobile Sharing</h4>
              <p className="text-sm text-gray-600">Use the Share button on mobile to quickly send to your contacts.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;