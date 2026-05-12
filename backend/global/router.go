package global

import (
	"log"
	"net/http"
)

// GeoRouter handles routing based on geographical metadata
type GeoRouter struct {
	DefaultRegion string
	RegionMap     map[string]string
}

// NewGeoRouter initializes a new geo-based router
func NewGeoRouter(defaultRegion string) *GeoRouter {
	return &GeoRouter{
		DefaultRegion: defaultRegion,
		RegionMap: map[string]string{
			"ID": "asia-southeast",
			"SG": "asia-southeast",
			"US": "us-east",
			"GB": "europe-west",
		},
	}
}

// GetRegionFromRequest identifies the region based on Cloudflare headers or IP
func (g *GeoRouter) GetRegionFromRequest(r *http.Request) string {
	// Cloudflare adds the 'CF-IPCountry' header
	country := r.Header.Get("CF-IPCountry")
	if region, ok := g.RegionMap[country]; ok {
		return region
	}
	
	log.Printf("[GeoRouter] Unknown country '%s', falling back to %s", country, g.DefaultRegion)
	return g.DefaultRegion
}

// GetReadReplicaURL returns the database URL for the specified region
func (g *GeoRouter) GetReadReplicaURL(region string) string {
	// In a real scenario, this would return the connection string for the local replica
	return region + ".db.hagumi.app"
}
