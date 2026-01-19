import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AgentCard from '@/components/agents/AgentCard';

describe('AgentCard', () => {
  const mockAgent = {
    id: '1',
    userId: 'user1',
    name: 'Test Agent',
    description: 'A test agent',
    systemPrompt: 'You are a test agent',
    llmProvider: 'openai' as const,
    llmModel: 'gpt-4',
    llmTemperature: 0.7,
    llmMaxTokens: 4096,
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  it('should render agent information', () => {
    render(<AgentCard agent={mockAgent} />);

    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('A test agent')).toBeInTheDocument();
    expect(screen.getByText('openai')).toBeInTheDocument();
    expect(screen.getByText('gpt-4')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <AgentCard 
        agent={mockAgent} 
        onEdit={mockOnEdit} 
        showActions={true}
      />
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockAgent);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <AgentCard 
        agent={mockAgent} 
        onDelete={mockOnDelete}
        showActions={true}
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockAgent.id);
  });

  it('should not show actions when showActions is false', () => {
    render(
      <AgentCard 
        agent={mockAgent} 
        showActions={false}
      />
    );

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('should display public badge when agent is public', () => {
    const publicAgent = { ...mockAgent, isPublic: true };
    render(<AgentCard agent={publicAgent} />);

    expect(screen.getByText('Public')).toBeInTheDocument();
  });
});
