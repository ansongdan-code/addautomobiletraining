const mongoose = require('mongoose');

const websiteSettingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: [true, 'Site name is required'],
    default: 'Auto Training Academy'
  },
  siteDescription: {
    type: String,
    maxlength: [500, 'Site description cannot be more than 500 characters'],
    default: 'Your journey to becoming an automotive expert starts here'
  },
  logo: {
    type: String,
    default: null
  },
  favicon: {
    type: String,
    default: null
  },
  primaryColor: {
    type: String,
    default: '#2196F3'
  },
  secondaryColor: {
    type: String,
    default: '#FFC107'
  },
  footerText: {
    type: String,
    default: 'Connect With Us'
  },
  contactInfo: {
    email: {
      type: String,
      default: 'info@autotrainingacademy.com'
    },
    phone: {
      type: String,
      default: '+1 (555) 123-4567'
    },
    address: {
      type: String,
      default: '123 Training Street, Education City, EC 12345'
    }
  },
  socialMedia: {
    facebook: {
      type: String,
      default: 'https://facebook.com'
    },
    twitter: {
      type: String,
      default: 'https://twitter.com'
    },
    instagram: {
      type: String,
      default: 'https://instagram.com'
    },
    linkedin: {
      type: String,
      default: 'https://linkedin.com'
    },
    youtube: {
      type: String,
      default: 'https://youtube.com'
    },
    tiktok: {
      type: String,
      default: 'https://tiktok.com'
    }
  },
  seo: {
    metaTitle: {
      type: String,
      default: 'Auto Training Academy - Professional Automotive Training'
    },
    metaDescription: {
      type: String,
      default: 'Professional automotive training courses for beginners and experts. Learn engine repair, diagnostics, and modern automotive technology.'
    },
    keywords: [{
      type: String
    }],
    googleAnalytics: {
      type: String,
      default: null
    },
    facebookPixel: {
      type: String,
      default: null
    }
  },
  hero: {
    title: {
      type: String,
      default: 'Welcome to Auto Training Academy'
    },
    subtitle: {
      type: String,
      default: 'Your journey to becoming an automotive expert starts here'
    },
    backgroundImage: {
      type: String,
      default: null
    },
    ctaText: {
      type: String,
      default: 'Start Learning Today'
    },
    secondaryCtaText: {
      type: String,
      default: 'View Courses'
    }
  },
  features: [{
    icon: {
      type: String,
      default: '🎓'
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  stats: [{
    label: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  paymentMethods: {
    paypal: {
      enabled: {
        type: Boolean,
        default: true
      },
      clientId: {
        type: String,
        default: null
      },
      clientSecret: {
        type: String,
        default: null
      }
    },
    paystack: {
      enabled: {
        type: Boolean,
        default: false
      },
      publicKey: {
        type: String,
        default: null
      },
      secretKey: {
        type: String,
        default: null
      }
    },
    stripe: {
      enabled: {
        type: Boolean,
        default: false
      },
      publicKey: {
        type: String,
        default: null
      },
      secretKey: {
        type: String,
        default: null
      }
    }
  },
  maintenance: {
    enabled: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: 'We are currently performing maintenance. Please check back later.'
    }
  },
  newsletter: {
    enabled: {
      type: Boolean,
      default: true
    },
    mailchimp: {
      apiKey: String,
      listId: String
    }
  },
  theme: {
    fontFamily: { type: String, default: 'Arial, sans-serif' },
    primaryColor: { type: String, default: '#2196F3' },
    secondaryColor: { type: String, default: '#FFC107' },
    backgroundColor: { type: String, default: '#FFFFFF' },
    textColor: { type: String, default: '#333333' }
  },
  customCSS: {
    type: String,
    default: ''
  },
  customJS: {
    type: String,
    default: ''
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
websiteSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

websiteSettingsSchema.statics.updateSettings = async function(updates, userId) {
  const settings = await this.getSettings();
  Object.assign(settings, updates);
  settings.lastUpdated = new Date();
  settings.updatedBy = userId;
  return await settings.save();
};

module.exports = mongoose.model('WebsiteSettings', websiteSettingsSchema);
