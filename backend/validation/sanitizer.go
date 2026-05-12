package validation

import (
	"html"
	"regexp"
	"strings"
	"unicode"
)

// Sanitizer provides input sanitization functions
type Sanitizer struct {
	htmlRegex      *regexp.Regexp
	scriptRegex    *regexp.Regexp
	sqlRegex       *regexp.Regexp
	xssRegex       *regexp.Regexp
	pathRegex      *regexp.Regexp
}

// NewSanitizer creates a new sanitizer
func NewSanitizer() *Sanitizer {
	return &Sanitizer{
		htmlRegex:   regexp.MustCompile(`<[^>]*>`),
		scriptRegex: regexp.MustCompile(`(?i)<script[^>]*>.*?</script>`),
		sqlRegex:    regexp.MustCompile(`(?i)(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|UNION|OR|AND)\b|['";--])`),
		xssRegex:    regexp.MustCompile(`(?i)(javascript:|on\w+\s*=|<iframe|<object|<embed)`),
		pathRegex:   regexp.MustCompile(`(\.\./|\.\.\\)`),
	}
}

// SanitizeString sanitizes a string input
func (s *Sanitizer) SanitizeString(input string) string {
	if input == "" {
		return input
	}
	
	// Trim whitespace
	input = strings.TrimSpace(input)
	
	// Remove HTML tags
	input = s.htmlRegex.ReplaceAllString(input, "")
	
	// Remove script tags
	input = s.scriptRegex.ReplaceAllString(input, "")
	
	// Remove XSS patterns
	input = s.xssRegex.ReplaceAllString(input, "")
	
	// Remove path traversal patterns
	input = s.pathRegex.ReplaceAllString(input, "")
	
	// Escape HTML entities
	input = html.EscapeString(input)
	
	return input
}

// SanitizeEmail sanitizes an email address
func (s *Sanitizer) SanitizeEmail(email string) string {
	if email == "" {
		return email
	}
	
	email = strings.TrimSpace(email)
	email = strings.ToLower(email)
	
	// Remove any HTML or script tags
	email = s.htmlRegex.ReplaceAllString(email, "")
	email = s.scriptRegex.ReplaceAllString(email, "")
	
	return email
}

// SanitizeUsername sanitizes a username
func (s *Sanitizer) SanitizeUsername(username string) string {
	if username == "" {
		return username
	}
	
	username = strings.TrimSpace(username)
	
	// Remove any HTML or script tags
	username = s.htmlRegex.ReplaceAllString(username, "")
	username = s.scriptRegex.ReplaceAllString(username, "")
	
	// Remove any SQL injection patterns
	username = s.sqlRegex.ReplaceAllString(username, "")
	
	return username
}

// SanitizePetName sanitizes a pet name
func (s *Sanitizer) SanitizePetName(name string) string {
	if name == "" {
		return name
	}
	
	name = strings.TrimSpace(name)
	
	// Remove any HTML or script tags
	name = s.htmlRegex.ReplaceAllString(name, "")
	name = s.scriptRegex.ReplaceAllString(name, "")
	
	// Remove any SQL injection patterns
	name = s.sqlRegex.ReplaceAllString(name, "")
	
	return name
}

// SanitizeID sanitizes an ID (user ID, pet ID, etc.)
func (s *Sanitizer) SanitizeID(id string) string {
	if id == "" {
		return id
	}
	
	id = strings.TrimSpace(id)
	
	// Remove any SQL injection patterns
	id = s.sqlRegex.ReplaceAllString(id, "")
	
	// Remove any path traversal patterns
	id = s.pathRegex.ReplaceAllString(id, "")
	
	return id
}

// SanitizeAction sanitizes a game action
func (s *Sanitizer) SanitizeAction(action string) string {
	if action == "" {
		return action
	}
	
	action = strings.TrimSpace(action)
	action = strings.ToLower(action)
	
	// Remove any HTML or script tags
	action = s.htmlRegex.ReplaceAllString(action, "")
	action = s.scriptRegex.ReplaceAllString(action, "")
	
	return action
}

// SanitizeText sanitizes general text input
func (s *Sanitizer) SanitizeText(text string) string {
	if text == "" {
		return text
	}
	
	text = strings.TrimSpace(text)
	
	// Remove HTML tags
	text = s.htmlRegex.ReplaceAllString(text, "")
	
	// Remove script tags
	text = s.scriptRegex.ReplaceAllString(text, "")
	
	// Remove XSS patterns
	text = s.xssRegex.ReplaceAllString(text, "")
	
	// Escape HTML entities
	text = html.EscapeString(text)
	
	return text
}

// SanitizeSQLInput sanitizes input that will be used in SQL queries
func (s *Sanitizer) SanitizeSQLInput(input string) string {
	if input == "" {
		return input
	}
	
	input = strings.TrimSpace(input)
	
	// Remove SQL injection patterns
	input = s.sqlRegex.ReplaceAllString(input, "")
	
	// Escape single quotes
	input = strings.ReplaceAll(input, "'", "''")
	
	return input
}

// SanitizePath sanitizes a file path
func (s *Sanitizer) SanitizePath(path string) string {
	if path == "" {
		return path
	}
	
	path = strings.TrimSpace(path)
	
	// Remove path traversal patterns
	path = s.pathRegex.ReplaceAllString(path, "")
	
	// Remove any null bytes
	path = strings.ReplaceAll(path, "\x00", "")
	
	return path
}

// SanitizeJSON sanitizes JSON input
func (s *Sanitizer) SanitizeJSON(jsonStr string) string {
	if jsonStr == "" {
		return jsonStr
	}
	
	// Remove any script tags
	jsonStr = s.scriptRegex.ReplaceAllString(jsonStr, "")
	
	// Remove XSS patterns
	jsonStr = s.xssRegex.ReplaceAllString(jsonStr, "")
	
	return jsonStr
}

// SanitizeNumber sanitizes a numeric string
func (s *Sanitizer) SanitizeNumber(numStr string) string {
	if numStr == "" {
		return numStr
	}
	
	numStr = strings.TrimSpace(numStr)
	
	// Remove any non-numeric characters except decimal point and minus sign
	result := ""
	for _, char := range numStr {
		if unicode.IsDigit(char) || char == '.' || char == '-' {
			result += string(char)
		}
	}
	
	return result
}

// SanitizeURL sanitizes a URL
func (s *Sanitizer) SanitizeURL(url string) string {
	if url == "" {
		return url
	}
	
	url = strings.TrimSpace(url)
	
	// Remove javascript: protocol
	url = strings.ToLower(url)
	if strings.HasPrefix(url, "javascript:") {
		return ""
	}
	
	// Remove any script tags
	url = s.scriptRegex.ReplaceAllString(url, "")
	
	// Remove XSS patterns
	url = s.xssRegex.ReplaceAllString(url, "")
	
	return url
}

// SanitizeHTML sanitizes HTML content (allows safe HTML)
func (s *Sanitizer) SanitizeHTML(htmlContent string) string {
	if htmlContent == "" {
		return htmlContent
	}
	
	// Remove script tags
	htmlContent = s.scriptRegex.ReplaceAllString(htmlContent, "")
	
	// Remove dangerous event handlers
	dangerousEvents := []string{
		"onload", "onerror", "onclick", "onmouseover", "onmouseout",
		"onfocus", "onblur", "onkeydown", "onkeyup", "onkeypress",
		"onsubmit", "onreset", "onchange", "onselect",
	}
	
	for _, event := range dangerousEvents {
		regex := regexp.MustCompile(`(?i)` + event + `\s*=`)
		htmlContent = regex.ReplaceAllString(htmlContent, "")
	}
	
	// Remove dangerous tags
	dangerousTags := []string{
		"<script", "</script>", "<iframe", "</iframe>",
		"<object", "</object>", "<embed", "</embed>",
		"<form", "</form>", "<input", "<button",
	}
	
	for _, tag := range dangerousTags {
		htmlContent = strings.ReplaceAll(htmlContent, tag, "")
	}
	
	return htmlContent
}

// SanitizeMultiple sanitizes multiple strings
func (s *Sanitizer) SanitizeMultiple(inputs []string) []string {
	result := make([]string, len(inputs))
	for i, input := range inputs {
		result[i] = s.SanitizeString(input)
	}
	return result
}

// StripTags removes all HTML tags from a string
func (s *Sanitizer) StripTags(input string) string {
	return s.htmlRegex.ReplaceAllString(input, "")
}

// EscapeHTML escapes HTML special characters
func (s *Sanitizer) EscapeHTML(input string) string {
	return html.EscapeString(input)
}

// UnescapeHTML unescapes HTML entities
func (s *Sanitizer) UnescapeHTML(input string) string {
	return html.UnescapeString(input)
}

// Truncate truncates a string to a maximum length
func (s *Sanitizer) Truncate(input string, maxLength int) string {
	if len(input) <= maxLength {
		return input
	}
	return input[:maxLength]
}

// TruncateWithEllipsis truncates a string and adds ellipsis
func (s *Sanitizer) TruncateWithEllipsis(input string, maxLength int) string {
	if len(input) <= maxLength {
		return input
	}
	return input[:maxLength-3] + "..."
}