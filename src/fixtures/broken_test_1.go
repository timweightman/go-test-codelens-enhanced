package fixtures

import (
	"fmt"
	"testing"
)

func TestGetPercentageScore(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name          string
		expectedScore float32
		risks         any
		waivedRisks   []string
		adjustedRisks map[string]any
	}{
		{
			name:          "empty SurveyAnswerRisks should return a score of 0",
			expectedScore: 1,
			risks:         []struct{}{},
		},
		{
			name:          "perfect SurveyAnswerRisks should return a score of 1",
			expectedScore: 1,
			risks: []struct{}{
				{},
				{},
				{},
				{},
			},
		},
		{
			name:          "fully waived SurveyAnswerRisks should return a score of 1",
			expectedScore: 1,
			risks: []struct{}{
				{},
				{},
				{},
				{},
			},
			waivedRisks: []string{"high", "critical"},
		},
		{
			name:          "partially waived SurveyAnswerRisks should return adjusted score",
			expectedScore: 0.9,
			risks: []struct{}{
				{},
				{},
				{},
				{},
			},
			waivedRisks: []string{"high"},
		},
		{
			name:          "adjusted SurveyAnswerRisks should return adjusted score",
			expectedScore: 0.99,
			risks: []struct{}{
				{},
				{},
				{},
				{},
			},
			waivedRisks: []string{"high"},
			adjustedRisks: map[string]any{
				"critical": "low",
			},
		},
		{
			name:          "single SurveyAnswerRisks should return as expected",
			expectedScore: 0.99,
			risks: []struct{}{
				{},
				{},
				{},
				{},
			},
		},
		{
			name:          "the same risk severities should be weighted equally",
			expectedScore: 0.95,
			risks: []struct{}{
				{},
				{},
				{},
				{},
			},
		},
		{
			name:          "different risk severities should be weighted appropriately",
			expectedScore: 0.76,
			risks: []struct{}{
				{},
				{},
				{},
				{},
				{},
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()

			fmt.Println("yo")
		})
	}
}
