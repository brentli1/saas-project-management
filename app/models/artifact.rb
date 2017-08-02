class Artifact < ActiveRecord::Base
  attr_accessor :upload
  belongs_to :project

  MAX_FILE_SIZE = 10.megabytes

  validates_presences_of :name, :upload
  validates_uniqueness_of :name
  validate :uploaded_file_size

  private
  def uploaded_file_size
    if upload && upload.size > self.class::MAX_FILE_SIZE
      errors.add(:upload, "File size must be less than #{self.class::MAX_FILE_SIZE}")
    end
  end
end
