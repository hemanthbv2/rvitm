<?php
/**
 * Plugin Name: RVITM Chatbot
 * Plugin URI:  https://rvitm.edu.in
 * Description: Intelligent AI Admissions & Campus Assistant for RV Institute of Technology and Management (RVITM). Features client-side NLP, dual-write telemetry with WordPress MySQL & Node.js/MongoDB Vercel Dashboard, voice recognition, and responsive glassmorphism UI.
 * Version:     1.0.0
 * Author:      RV Educational Institutions (RSST)
 * Author URI:  https://rvei.edu.in
 * License:     GPL-2.0+
 * Text Domain: rvitm-chatbot
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class RVITM_Chatbot_Plugin {
    private static $instance = null;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Activation & Local Storage Setup
        register_activation_hook(__FILE__, array($this, 'activate_plugin'));

        // Enqueue Assets
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));

        // Render Widget HTML in Footer
        add_action('wp_footer', array($this, 'render_chatbot_widget'));

        // Admin Settings Menu
        add_action('admin_menu', array($this, 'register_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));

        // WordPress REST API Routes
        add_action('rest_api_init', array($this, 'register_rest_routes'));
    }

    public function activate_plugin() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        $leads_table = $wpdb->prefix . 'rvitm_leads';
        $events_table = $wpdb->prefix . 'rvitm_events';

        $sql_leads = "CREATE TABLE IF NOT EXISTS $leads_table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            timestamp datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            session_id varchar(100) NOT NULL,
            name varchar(150) DEFAULT NULL,
            phone varchar(50) DEFAULT NULL,
            email varchar(150) DEFAULT NULL,
            data longtext DEFAULT NULL,
            PRIMARY KEY  (id)
        ) $charset_collate;";

        $sql_events = "CREATE TABLE IF NOT EXISTS $events_table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            timestamp datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            session_id varchar(100) NOT NULL,
            event_type varchar(100) NOT NULL,
            query text DEFAULT NULL,
            intent_id varchar(100) DEFAULT NULL,
            data longtext DEFAULT NULL,
            PRIMARY KEY  (id)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_leads);
        dbDelta($sql_events);
    }

    public function enqueue_frontend_assets() {
        $plugin_url = plugin_dir_url(__FILE__);
        $version = '1.0.0';

        wp_enqueue_style('rvitm-chatbot-css', $plugin_url . 'rvitm-chatbot.css', array(), $version);

        wp_enqueue_script('rvitm-kb-js', $plugin_url . 'rvitm-knowledge-base.js', array(), $version, true);
        wp_enqueue_script('rvitm-pages-js', $plugin_url . 'rvitm-pages-index.js', array(), $version, true);
        wp_enqueue_script('rvitm-engine-js', $plugin_url . 'rvitm-engine.js', array('rvitm-kb-js', 'rvitm-pages-js'), $version, true);
        wp_enqueue_script('rvitm-telemetry-js', $plugin_url . 'telemetry.js', array(), $version, true);
        wp_enqueue_script('rvitm-chatbot-js', $plugin_url . 'rvitm-chatbot.js', array('rvitm-kb-js', 'rvitm-pages-js', 'rvitm-engine-js', 'rvitm-telemetry-js'), $version, true);

        // Localize settings for telemetry
        $vercel_url = get_option('rvitm_chatbot_vercel_url', '');
        wp_localize_script('rvitm-chatbot-js', 'rvitmChatbotSettings', array(
            'wpRestUrl' => esc_url_raw(rest_url('rvitm-chatbot/v1')),
            'vercelUrl' => esc_url_raw($vercel_url),
            'pluginUrl' => esc_url_raw($plugin_url),
            'instituteId' => 'rvitm'
        ));
    }

    public function render_chatbot_widget() {
        $logo_url = plugin_dir_url(__FILE__) . 'rvitm_logo.png';
        ?>
        <!-- Particle Canvas -->
        <canvas id="particles"></canvas>

        <div class="app-container">
            <button class="chat-fab" id="chatFab" title="Chat with RVITM Assistant" aria-label="Open RVITM chatbot">
                <span class="fab-icon open-icon">
                    <img src="<?php echo esc_url($logo_url); ?>" alt="RVITM Logo" style="width: 38px; height: 38px; object-fit: contain; border-radius: 50%; background: #ffffff; padding: 2px;">
                </span>
                <span class="fab-icon close-icon">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </span>
                <span class="fab-badge" id="fabBadge">1</span>
            </button>

            <div class="chat-window" id="chatWindow" role="dialog" aria-label="RVITM Chatbot" aria-modal="false">
                <div class="chat-header">
                    <div class="header-left">
                        <div class="avatar-container">
                            <div class="avatar">
                                <img src="<?php echo esc_url($logo_url); ?>" alt="RVITM Logo">
                            </div>
                            <div class="avatar-ring"></div>
                        </div>
                        <div class="header-info">
                            <h1>RVITM Assistant</h1>
                            <div class="status-row">
                                <span class="status-dot"></span>
                                <span class="status-text">Online — Ready to assist</span>
                            </div>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="icon-btn" id="ttsBtn" title="Voice Output Toggle" aria-label="Voice Output">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            </svg>
                        </button>
                        <button class="icon-btn" id="clearBtn" title="Clear Chat History" aria-label="Clear chat">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="chat-messages" id="chatMessages" role="log" aria-live="polite"></div>

                <div class="typing-indicator" id="typingIndicator">
                    <div class="typing-bubble">
                        <span style="font-size: 11px; font-weight: 500; color: #94a3b8;">RVITM Assistant typing</span>
                        <div class="typing-dots"><span></span><span></span><span></span></div>
                    </div>
                </div>

                <div class="quick-suggestions" id="quickSuggestions">
                    <button class="suggestion-chip" data-query="greet">📋 Main Menu</button>
                    <button class="suggestion-chip" data-query="placements">💼 Placements</button>
                    <button class="suggestion-chip" data-query="admissions">🎓 Admissions</button>
                    <button class="suggestion-chip" data-query="departments">📚 Departments</button>
                    <button class="suggestion-chip" data-query="contact">📞 Contact Us</button>
                </div>

                <div class="chat-input-area" style="position: relative;">
                    <div id="typeahead" class="typeahead-container hidden"></div>
                    <div class="input-wrapper">
                        <input type="text" id="chatInput" class="chat-input" placeholder="Ask about admissions, placements, HODs..." autocomplete="off">
                        <button id="micBtn" class="input-action-btn" title="Voice Search">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" y1="19" x2="12" y2="23"></line>
                                <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                        </button>
                    </div>
                    <button id="sendBtn" class="send-btn" title="Send Question">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <?php
    }

    public function register_admin_menu() {
        add_options_page(
            'RVITM Chatbot Settings',
            'RVITM Chatbot',
            'manage_options',
            'rvitm-chatbot-settings',
            array($this, 'render_admin_settings_page')
        );
    }

    public function register_settings() {
        register_setting('rvitm_chatbot_settings_group', 'rvitm_chatbot_vercel_url');
    }

    public function render_admin_settings_page() {
        ?>
        <div class="wrap">
            <h1>RVITM Chatbot Settings</h1>
            <p>Configure the dual-write endpoint for real-time synchronization with the Node.js/MongoDB Vercel Dashboard.</p>
            <form method="post" action="options.php">
                <?php settings_fields('rvitm_chatbot_settings_group'); ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">Vercel Backend URL</th>
                        <td>
                            <input type="url" name="rvitm_chatbot_vercel_url" value="<?php echo esc_attr(get_option('rvitm_chatbot_vercel_url', '')); ?>" class="regular-text" placeholder="https://your-dashboard.vercel.app" />
                            <p class="description">Enter the base URL of your Vercel Node.js dashboard without the trailing <code>/api</code>.</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    public function register_rest_routes() {
        register_rest_route('rvitm-chatbot/v1', '/interactions/batch', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_batch_interactions'),
            'permission_callback' => '__return_true'
        ));
    }

    public function handle_batch_interactions($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $batch = isset($params['batch']) ? $params['batch'] : array();

        if (empty($batch)) {
            return rest_ensure_response(array('success' => true, 'count' => 0));
        }

        $table = $wpdb->prefix . 'rvitm_events';
        foreach ($batch as $item) {
            $data = isset($item['data']) ? $item['data'] : array();
            $wpdb->insert($table, array(
                'timestamp' => isset($item['timestamp']) ? gmdate('Y-m-d H:i:s', strtotime($item['timestamp'])) : current_time('mysql', 1),
                'session_id' => isset($data['sessionId']) ? sanitize_text_field($data['sessionId']) : 'anonymous',
                'event_type' => isset($data['eventType']) ? sanitize_text_field($data['eventType']) : 'query',
                'query' => isset($data['query']) ? sanitize_text_field($data['query']) : '',
                'intent_id' => isset($data['intentId']) ? sanitize_text_field($data['intentId']) : '',
                'data' => wp_json_encode($data)
            ));
        }

        return rest_ensure_response(array('success' => true, 'count' => count($batch)));
    }
}

// Initialize Plugin
RVITM_Chatbot_Plugin::get_instance();
